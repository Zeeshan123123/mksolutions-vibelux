import { CreditManager } from '@/lib/credits/credit-manager';
import { CREDIT_COSTS } from '@/lib/pricing/unified-pricing';
import { logger } from '@/lib/logging/production-logger';

export interface OperationState {
  id: string;
  userId: string;
  type: 'aiDesigner' | 'report' | 'simulation' | 'api';
  subType: string;
  totalCost: number;
  creditsConsumed: number;
  status: 'pending' | 'in_progress' | 'paused' | 'completed' | 'failed';
  progress: number; // 0-100
  checkpoint?: any; // State to resume from
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}

export class OperationManager {
  private static operations: Map<string, OperationState> = new Map();

  /**
   * Start a new operation with credit pre-authorization
   */
  static async startOperation(
    userId: string,
    type: OperationState['type'],
    subType: string,
    estimatedCost: number
  ): Promise<{
    operationId: string;
    canProceed: boolean;
    creditsNeeded?: number;
    userBalance?: number;
  }> {
    const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const balance = await CreditManager.getBalance(userId);

    // Check if user has any credits at all
    if (balance.available === 0) {
      return {
        operationId,
        canProceed: false,
        creditsNeeded: estimatedCost,
        userBalance: 0
      };
    }

    // Create operation state
    const operation: OperationState = {
      id: operationId,
      userId,
      type,
      subType,
      totalCost: estimatedCost,
      creditsConsumed: 0,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.operations.set(operationId, operation);

    // Check if user has enough credits for full operation
    const canProceedFully = balance.available >= estimatedCost;

    return {
      operationId,
      canProceed: true, // Allow start even with partial credits
      creditsNeeded: canProceedFully ? 0 : estimatedCost - balance.available,
      userBalance: balance.available
    };
  }

  /**
   * Update operation progress and consume credits incrementally
   */
  static async updateProgress(
    operationId: string,
    progress: number,
    checkpoint?: any
  ): Promise<{
    success: boolean;
    shouldPause: boolean;
    creditsNeeded?: number;
    error?: string;
  }> {
    const operation = this.operations.get(operationId);
    if (!operation) {
      return { success: false, shouldPause: false, error: 'Operation not found' };
    }

    // Calculate credits needed for this progress increment
    const progressDelta = progress - operation.progress;
    const creditsForProgress = Math.ceil((progressDelta / 100) * operation.totalCost);

    // Check if user has credits for this increment
    const hasCredits = await CreditManager.hasCredits(
      operation.userId,
      operation.type,
      operation.subType as any,
      creditsForProgress
    );

    if (!hasCredits) {
      // Pause operation and save checkpoint
      operation.status = 'paused';
      operation.checkpoint = checkpoint;
      operation.updatedAt = new Date();
      
      const balance = await CreditManager.getBalance(operation.userId);
      const remainingCost = operation.totalCost - operation.creditsConsumed;
      const creditsNeeded = remainingCost - balance.available;

      logger.info('api', `Operation ${operationId} paused - needs ${creditsNeeded} more credits`);

      return {
        success: true,
        shouldPause: true,
        creditsNeeded
      };
    }

    // Consume credits for this progress
    const result = await CreditManager.useCredits(
      operation.userId,
      operation.type,
      operation.subType as any,
      creditsForProgress,
      {
        operationId,
        progress,
        checkpoint
      }
    );

    if (!result.success) {
      return { success: false, shouldPause: false, error: result.error };
    }

    // Update operation state
    operation.progress = progress;
    operation.creditsConsumed += creditsForProgress;
    operation.status = progress >= 100 ? 'completed' : 'in_progress';
    operation.checkpoint = checkpoint;
    operation.updatedAt = new Date();

    return { success: true, shouldPause: false };
  }

  /**
   * Resume a paused operation after credit purchase
   */
  static async resumeOperation(
    operationId: string
  ): Promise<{
    success: boolean;
    checkpoint?: any;
    remainingCost?: number;
    error?: string;
  }> {
    const operation = this.operations.get(operationId);
    if (!operation) {
      return { success: false, error: 'Operation not found' };
    }

    if (operation.status !== 'paused') {
      return { success: false, error: 'Operation is not paused' };
    }

    const remainingCost = operation.totalCost - operation.creditsConsumed;
    const balance = await CreditManager.getBalance(operation.userId);

    if (balance.available < remainingCost) {
      return {
        success: false,
        error: `Still need ${remainingCost - balance.available} more credits`,
        remainingCost
      };
    }

    // Resume operation
    operation.status = 'in_progress';
    operation.updatedAt = new Date();

    logger.info('api', `Operation ${operationId} resumed`);

    return {
      success: true,
      checkpoint: operation.checkpoint,
      remainingCost
    };
  }

  /**
   * Get operation status and details
   */
  static getOperation(operationId: string): OperationState | null {
    return this.operations.get(operationId) || null;
  }

  /**
   * Clean up completed/failed operations older than 24 hours
   */
  static cleanupOldOperations(): void {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (const [id, operation] of this.operations.entries()) {
      if (
        (operation.status === 'completed' || operation.status === 'failed') &&
        operation.updatedAt < cutoff
      ) {
        this.operations.delete(id);
      }
    }
  }
}