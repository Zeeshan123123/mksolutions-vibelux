/**
 * Affiliate Commission Payout Service
 * Processes monthly payouts for affiliate commissions
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/production-logger';
import { stripeConnect } from '@/lib/stripe/affiliate-connect';
import { db } from '@/lib/db/affiliate-queries';
import { CommissionStatus, PayoutStatus } from '@prisma/client';
import { sendEmail } from '@/lib/email';

export async function processAffiliatePayouts(): Promise<{
  success: boolean;
  processed: number;
  failed: number;
  totalPaid: number;
  errors: string[];
}> {
  let processed = 0;
  let failed = 0;
  let totalPaid = 0;
  const errors: string[] = [];
  
  try {
    // Get all pending commissions that are due
    const dueCommissions = await prisma.affiliateCommission.groupBy({
      by: ['affiliateId'],
      where: {
        status: CommissionStatus.PENDING,
        payoutDate: {
          lte: new Date()
        }
      },
      _sum: {
        amount: true
      }
    });
    
    // Process each affiliate's payout
    for (const commission of dueCommissions) {
      try {
        const affiliate = await prisma.affiliate.findUnique({
          where: { id: commission.affiliateId },
          include: { 
            user: true,
            payouts: {
              where: {
                status: 'COMPLETED'
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 1
            }
          }
        });
        
        if (!affiliate) {
          errors.push(`Affiliate ${commission.affiliateId} not found`);
          failed++;
          continue;
        }
        
        const payoutAmount = commission._sum.amount || 0;
        
        // Skip if payout is below minimum threshold ($50)
        if (payoutAmount < 50) {
          continue;
        }
        
        // Create payout record
        const period = new Date().toISOString().substring(0, 7); // YYYY-MM format
        const payout = await db.affiliatePayouts.create({
          affiliateId: affiliate.id,
          amount: payoutAmount,
          period,
          status: PayoutStatus.PENDING
        });
        
        try {
          // Process payment via Stripe Connect if affiliate has connected account
          if (affiliate.stripeAccountId) {
            const { transfer, netAmount, platformFee } = await stripeConnect.createPayoutWithFee(
              affiliate.stripeAccountId,
              payoutAmount,
              2.5, // 2.5% platform fee
              `VibeLux affiliate commission payout for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
            );
            
            // Update payout with Stripe transfer ID
            await db.affiliatePayouts.markAsPaid(
              payout.id,
              transfer.id
            );
            
            // Mark commissions as paid
            const commissionIds = await prisma.affiliateCommission.findMany({
              where: {
                affiliateId: affiliate.id,
                status: CommissionStatus.PENDING
              },
              select: { id: true }
            }).then(commissions => commissions.map(c => c.id));
            
            await db.affiliateCommissions.markAsPaid(commissionIds, transfer.id);
          } else {
            // For manual payouts, mark as pending manual processing
            await prisma.affiliatePayout.update({
              where: { id: payout.id },
              data: {
                status: 'PENDING_MANUAL',
                notes: 'Awaiting manual bank transfer processing'
              }
            });
          }
          
          // Update all paid commissions
          await prisma.affiliateCommission.updateMany({
            where: {
              affiliateId: affiliate.id,
              status: 'PENDING',
              dueDate: {
                lte: new Date()
              }
            },
            data: {
              status: 'PAID',
              payoutId: payout.id,
              paidAt: new Date()
            }
          });
          
          // Update affiliate totals
          await prisma.affiliate.update({
            where: { id: affiliate.id },
            data: {
              totalPaidCommission: {
                increment: payoutAmount
              },
              totalPendingCommission: {
                decrement: payoutAmount
              },
              lastPayoutAt: new Date()
            }
          });
          
          // Send payout notification email
          if (affiliate.user.email && process.env.SENDGRID_API_KEY) {
            const lastPayoutDate = affiliate.payouts[0]?.createdAt || null;
            
            await sendEmail({
              to: affiliate.user.email,
              subject: 'Your VibeLux Commission Payout is Ready! 💰',
              html: `
                <h1>Commission Payout Processed</h1>
                <p>Great news! Your affiliate commission payout has been processed.</p>
                
                <p><strong>Payout Details:</strong></p>
                <ul>
                  <li>Amount: $${payoutAmount.toFixed(2)}</li>
                  <li>Method: ${affiliate.paymentMethod || 'Bank Transfer'}</li>
                  <li>Status: ${affiliate.stripeAccountId ? 'Sent to your Stripe account' : 'Processing via bank transfer'}</li>
                  ${lastPayoutDate ? `<li>Previous payout: ${lastPayoutDate.toLocaleDateString()}</li>` : ''}
                </ul>
                
                <p>${affiliate.stripeAccountId 
                  ? 'The funds have been transferred to your connected Stripe account and should be available according to your payout schedule.' 
                  : 'Bank transfers typically take 2-3 business days to process.'
                }</p>
                
                <p>Thank you for being a valued VibeLux affiliate partner!</p>
                
                <p><a href="https://vibelux.ai/affiliate/dashboard" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Dashboard</a></p>
              `
            }).catch((error) => logger.error('api', 'Async operation failed', error));
          }
          
          processed++;
          totalPaid += payoutAmount;
          
        } catch (paymentError) {
          // If payment fails, update payout status
          await prisma.affiliatePayout.update({
            where: { id: payout.id },
            data: {
              status: 'FAILED',
              notes: paymentError instanceof Error ? paymentError.message : 'Payment processing failed'
            }
          });
          
          failed++;
          errors.push(
            `Failed to process payout for affiliate ${affiliate.id}: ${
              paymentError instanceof Error ? paymentError.message : 'Unknown error'
            }`
          );
        }
        
      } catch (affiliateError) {
        failed++;
        errors.push(
          `Failed to process affiliate ${commission.affiliateId}: ${
            affiliateError instanceof Error ? affiliateError.message : 'Unknown error'
          }`
        );
      }
    }
    
    // Send admin summary
    if (process.env.SENDGRID_API_KEY && processed > 0) {
      await sendEmail({
        to: 'blake@vibelux.ai',
        subject: `Affiliate Payouts Processed - ${new Date().toLocaleDateString()}`,
        html: `
          <h2>Monthly Affiliate Payout Summary</h2>
          <p>The monthly affiliate commission payouts have been processed.</p>
          
          <p><strong>Summary:</strong></p>
          <ul>
            <li>Affiliates Paid: ${processed}</li>
            <li>Total Amount: $${totalPaid.toFixed(2)}</li>
            <li>Failed Payouts: ${failed}</li>
          </ul>
          
          ${errors.length > 0 ? `
            <p><strong>Errors:</strong></p>
            <ul>
              ${errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
          ` : ''}
          
          <p>Please review any failed payouts in the admin dashboard.</p>
        `
      }).catch((error) => logger.error('api', 'Async operation failed', error));
    }
    
    return {
      success: true,
      processed,
      failed,
      totalPaid,
      errors
    };
    
  } catch (error) {
    return {
      success: false,
      processed,
      failed: failed + 1,
      totalPaid,
      errors: [...errors, error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

// Export function to be called by cron job
export default processAffiliatePayouts;