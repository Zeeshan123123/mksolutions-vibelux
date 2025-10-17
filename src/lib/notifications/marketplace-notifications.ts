/**
 * Marketplace Notification Service
 * Handles equipment offers, service bids, and user invites
 */

import { NotificationService } from './notification-service';
import { db } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';

export interface EquipmentOffer {
  id: string;
  sellerId: string;
  buyerId: string;
  equipmentType: string;
  brand: string;
  model: string;
  condition: 'new' | 'used' | 'refurbished';
  price: number;
  quantity: number;
  message?: string;
  images?: string[];
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface ServiceBid {
  id: string;
  serviceProviderId: string;
  facilityId: string;
  serviceType: 'installation' | 'maintenance' | 'consulting' | 'design' | 'repair';
  description: string;
  estimatedCost: number;
  estimatedDuration: number; // in hours
  proposedStartDate: Date;
  documents?: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed';
}

export interface UserInvite {
  id: string;
  inviterId: string;
  inviteeEmail: string;
  facilityId: string;
  role: 'viewer' | 'operator' | 'manager' | 'admin';
  message?: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export class MarketplaceNotificationService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Send equipment offer notification
   */
  async sendEquipmentOfferNotification(offer: EquipmentOffer, recipientId: string) {
    try {
      // Create in-app notification
      const notification = await this.notificationService.createNotification({
        userId: recipientId,
        type: 'equipment_offer',
        title: 'New Equipment Offer',
        message: `You have received an offer for ${offer.quantity}x ${offer.brand} ${offer.model}`,
        data: {
          offerId: offer.id,
          equipmentType: offer.equipmentType,
          price: offer.price,
          condition: offer.condition
        },
        actionUrl: `/marketplace/offers/${offer.id}`,
        actionLabel: 'View Offer',
        priority: 'medium',
        category: 'marketplace'
      });

      // Send push notification if enabled
      await this.notificationService.sendPushNotification(recipientId, {
        title: 'New Equipment Offer',
        body: `${offer.brand} ${offer.model} - $${offer.price}`,
        data: { offerId: offer.id, type: 'equipment_offer' }
      });

      // Send email notification
      await this.notificationService.sendEmail({
        to: recipientId, // Will be resolved to email by notification service
        subject: 'New Equipment Offer on Vibelux',
        template: 'equipment-offer',
        data: {
          offer,
          viewOfferUrl: `${process.env.NEXT_PUBLIC_APP_URL}/marketplace/offers/${offer.id}`
        }
      });

      logger.info('api', 'Equipment offer notification sent', {
        offerId: offer.id,
        recipientId,
        equipmentType: offer.equipmentType
      });

      return notification;
    } catch (error) {
      logger.error('api', 'Failed to send equipment offer notification', error as Error, {
        offerId: offer.id,
        recipientId
      });
      throw error;
    }
  }

  /**
   * Send service bid notification
   */
  async sendServiceBidNotification(bid: ServiceBid, recipientId: string) {
    try {
      // Create in-app notification
      const notification = await this.notificationService.createNotification({
        userId: recipientId,
        type: 'service_bid',
        title: 'New Service Bid',
        message: `New ${bid.serviceType} service bid: $${bid.estimatedCost}`,
        data: {
          bidId: bid.id,
          serviceType: bid.serviceType,
          estimatedCost: bid.estimatedCost,
          proposedStartDate: bid.proposedStartDate
        },
        actionUrl: `/services/bids/${bid.id}`,
        actionLabel: 'Review Bid',
        priority: 'high',
        category: 'services'
      });

      // Send push notification
      await this.notificationService.sendPushNotification(recipientId, {
        title: 'New Service Bid',
        body: `${bid.serviceType} - $${bid.estimatedCost}`,
        data: { bidId: bid.id, type: 'service_bid' }
      });

      // Send email with bid details
      await this.notificationService.sendEmail({
        to: recipientId,
        subject: `New ${bid.serviceType} Service Bid`,
        template: 'service-bid',
        data: {
          bid,
          reviewBidUrl: `${process.env.NEXT_PUBLIC_APP_URL}/services/bids/${bid.id}`
        }
      });

      // Send SMS for high-value bids
      if (bid.estimatedCost > 5000) {
        await this.notificationService.sendSMS({
          to: recipientId,
          message: `New ${bid.serviceType} bid: $${bid.estimatedCost}. Review at vibelux.ai/bids/${bid.id}`
        });
      }

      logger.info('api', 'Service bid notification sent', {
        bidId: bid.id,
        recipientId,
        serviceType: bid.serviceType
      });

      return notification;
    } catch (error) {
      logger.error('api', 'Failed to send service bid notification', error as Error, {
        bidId: bid.id,
        recipientId
      });
      throw error;
    }
  }

  /**
   * Send user invite notification
   */
  async sendUserInviteNotification(invite: UserInvite) {
    try {
      // For invites, we send to email since user might not exist yet
      await this.notificationService.sendEmail({
        to: invite.inviteeEmail,
        subject: 'You\'ve been invited to join Vibelux',
        template: 'user-invite',
        data: {
          invite,
          inviterName: await this.getUserName(invite.inviterId),
          facilityName: await this.getFacilityName(invite.facilityId),
          acceptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invites/${invite.id}/accept`,
          signupUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up?invite=${invite.id}`
        }
      });

      // Create notification for inviter
      await this.notificationService.createNotification({
        userId: invite.inviterId,
        type: 'invite_sent',
        title: 'Invitation Sent',
        message: `Invitation sent to ${invite.inviteeEmail}`,
        data: {
          inviteId: invite.id,
          inviteeEmail: invite.inviteeEmail,
          role: invite.role
        },
        priority: 'low',
        category: 'team'
      });

      logger.info('api', 'User invite notification sent', {
        inviteId: invite.id,
        inviteeEmail: invite.inviteeEmail,
        role: invite.role
      });

      return true;
    } catch (error) {
      logger.error('api', 'Failed to send user invite notification', error as Error, {
        inviteId: invite.id,
        inviteeEmail: invite.inviteeEmail
      });
      throw error;
    }
  }

  /**
   * Send offer accepted notification
   */
  async sendOfferAcceptedNotification(offerId: string, sellerId: string) {
    try {
      const offer = await this.getEquipmentOffer(offerId);
      
      await this.notificationService.createNotification({
        userId: sellerId,
        type: 'offer_accepted',
        title: 'Offer Accepted!',
        message: `Your offer for ${offer.brand} ${offer.model} has been accepted`,
        data: { offerId, amount: offer.price },
        actionUrl: `/marketplace/offers/${offerId}`,
        actionLabel: 'View Details',
        priority: 'high',
        category: 'marketplace'
      });

      // Send push and email
      await this.notificationService.sendPushNotification(sellerId, {
        title: 'Offer Accepted!',
        body: `Your ${offer.brand} ${offer.model} offer was accepted`,
        data: { offerId, type: 'offer_accepted' }
      });

      await this.notificationService.sendEmail({
        to: sellerId,
        subject: 'Your Equipment Offer Was Accepted',
        template: 'offer-accepted',
        data: { offer }
      });

    } catch (error) {
      logger.error('api', 'Failed to send offer accepted notification', error as Error);
      throw error;
    }
  }

  /**
   * Send bid accepted notification
   */
  async sendBidAcceptedNotification(bidId: string, serviceProviderId: string) {
    try {
      const bid = await this.getServiceBid(bidId);
      
      await this.notificationService.createNotification({
        userId: serviceProviderId,
        type: 'bid_accepted',
        title: 'Bid Accepted!',
        message: `Your ${bid.serviceType} service bid has been accepted`,
        data: { 
          bidId, 
          amount: bid.estimatedCost,
          startDate: bid.proposedStartDate
        },
        actionUrl: `/services/bids/${bidId}`,
        actionLabel: 'View Project',
        priority: 'high',
        category: 'services'
      });

      // Send multiple channels for accepted bids
      await Promise.all([
        this.notificationService.sendPushNotification(serviceProviderId, {
          title: 'Bid Accepted!',
          body: `Your ${bid.serviceType} bid was accepted`,
          data: { bidId, type: 'bid_accepted' }
        }),
        this.notificationService.sendEmail({
          to: serviceProviderId,
          subject: 'Your Service Bid Was Accepted',
          template: 'bid-accepted',
          data: { bid }
        }),
        this.notificationService.sendSMS({
          to: serviceProviderId,
          message: `Bid accepted! ${bid.serviceType} project starts ${new Date(bid.proposedStartDate).toLocaleDateString()}`
        })
      ]);

    } catch (error) {
      logger.error('api', 'Failed to send bid accepted notification', error as Error);
      throw error;
    }
  }

  /**
   * Send invite accepted notification
   */
  async sendInviteAcceptedNotification(inviteId: string) {
    try {
      const invite = await this.getUserInvite(inviteId);
      
      await this.notificationService.createNotification({
        userId: invite.inviterId,
        type: 'invite_accepted',
        title: 'Invitation Accepted',
        message: `${invite.inviteeEmail} has joined your facility`,
        data: { 
          inviteId,
          inviteeEmail: invite.inviteeEmail,
          role: invite.role
        },
        actionUrl: `/team/members`,
        actionLabel: 'View Team',
        priority: 'medium',
        category: 'team'
      });

    } catch (error) {
      logger.error('api', 'Failed to send invite accepted notification', error as Error);
      throw error;
    }
  }

  /**
   * Send reminder notifications for expiring offers/invites
   */
  async sendExpiringReminders() {
    try {
      // Equipment offers expiring in 24 hours
      const expiringOffers = await this.getExpiringOffers(24);
      for (const offer of expiringOffers) {
        await this.notificationService.createNotification({
          userId: offer.buyerId,
          type: 'offer_expiring',
          title: 'Offer Expiring Soon',
          message: `Equipment offer for ${offer.brand} ${offer.model} expires in 24 hours`,
          data: { offerId: offer.id },
          actionUrl: `/marketplace/offers/${offer.id}`,
          actionLabel: 'Review Offer',
          priority: 'medium',
          category: 'marketplace'
        });
      }

      // User invites expiring in 48 hours
      const expiringInvites = await this.getExpiringInvites(48);
      for (const invite of expiringInvites) {
        await this.notificationService.sendEmail({
          to: invite.inviteeEmail,
          subject: 'Your Vibelux invitation is expiring',
          template: 'invite-reminder',
          data: {
            invite,
            acceptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invites/${invite.id}/accept`
          }
        });
      }

      logger.info('api', 'Expiring reminders sent', {
        offers: expiringOffers.length,
        invites: expiringInvites.length
      });

    } catch (error) {
      logger.error('api', 'Failed to send expiring reminders', error as Error);
      throw error;
    }
  }

  // Helper methods
  private async getUserName(userId: string): Promise<string> {
    // Implementation to get user name from database
    return 'User';
  }

  private async getFacilityName(facilityId: string): Promise<string> {
    // Implementation to get facility name from database
    return 'Facility';
  }

  private async getEquipmentOffer(offerId: string): Promise<EquipmentOffer> {
    // Implementation to get offer from database
    throw new Error('Not implemented');
  }

  private async getServiceBid(bidId: string): Promise<ServiceBid> {
    // Implementation to get bid from database
    throw new Error('Not implemented');
  }

  private async getUserInvite(inviteId: string): Promise<UserInvite> {
    // Implementation to get invite from database
    throw new Error('Not implemented');
  }

  private async getExpiringOffers(hoursUntilExpiry: number): Promise<EquipmentOffer[]> {
    // Implementation to get expiring offers from database
    return [];
  }

  private async getExpiringInvites(hoursUntilExpiry: number): Promise<UserInvite[]> {
    // Implementation to get expiring invites from database
    return [];
  }
}

// Export singleton instance
export const marketplaceNotifications = new MarketplaceNotificationService();