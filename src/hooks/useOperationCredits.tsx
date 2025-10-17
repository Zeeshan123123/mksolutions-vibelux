'use client';

import React, { useState, useCallback } from 'react';
import { OperationManager } from '@/lib/credits/operation-manager';
import { DepositToCompleteModal } from '@/components/credits/DepositToCompleteModal';
import { logger } from '@/lib/client-logger';

export interface UseOperationCreditsOptions {
  type: 'aiDesigner' | 'report' | 'simulation' | 'api';
  subType: string;
  operationName: string;
  estimatedCost: number;
  onComplete?: (result: any) => void;
  onCancel?: () => void;
}

export function useOperationCredits(options: UseOperationCreditsOptions) {
  const [operationId, setOperationId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [creditsNeeded, setCreditsNeeded] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const startOperation = useCallback(async () => {
    try {
      const result = await OperationManager.startOperation(
        'current-user-id', // This would come from auth context
        options.type,
        options.subType,
        options.estimatedCost
      );

      setOperationId(result.operationId);

      if (result.creditsNeeded && result.creditsNeeded > 0) {
        // User doesn't have enough credits for full operation
        logger.info('api', `Operation needs ${result.creditsNeeded} more credits`);
        // Continue anyway - will pause when credits run out
      }

      return {
        operationId: result.operationId,
        canProceed: result.canProceed,
        creditsNeeded: result.creditsNeeded || 0
      };
    } catch (error) {
      logger.error('api', 'Failed to start operation:', error);
      throw error;
    }
  }, [options]);

  const updateProgress = useCallback(async (
    newProgress: number,
    checkpoint?: any
  ) => {
    if (!operationId) {
      throw new Error('No operation in progress');
    }

    try {
      const result = await OperationManager.updateProgress(
        operationId,
        newProgress,
        checkpoint
      );

      setProgress(newProgress);

      if (result.shouldPause && result.creditsNeeded) {
        // Operation paused - need more credits
        setIsPaused(true);
        setCreditsNeeded(result.creditsNeeded);
        setIsModalOpen(true);
        return { paused: true, creditsNeeded: result.creditsNeeded };
      }

      if (newProgress >= 100 && options.onComplete) {
        options.onComplete(checkpoint);
      }

      return { paused: false };
    } catch (error) {
      logger.error('api', 'Failed to update progress:', error);
      throw error;
    }
  }, [operationId, options]);

  const resumeOperation = useCallback(async () => {
    if (!operationId) {
      throw new Error('No operation to resume');
    }

    try {
      const result = await OperationManager.resumeOperation(operationId);
      
      if (result.success) {
        setIsPaused(false);
        setIsModalOpen(false);
        return result.checkpoint;
      } else {
        throw new Error(result.error || 'Failed to resume operation');
      }
    } catch (error) {
      logger.error('api', 'Failed to resume operation:', error);
      throw error;
    }
  }, [operationId]);

  const cancelOperation = useCallback(() => {
    setIsModalOpen(false);
    if (options.onCancel) {
      options.onCancel();
    }
  }, [options]);

  // Return the modal component as part of the hook
  const CreditModal = useCallback(() => (
    <DepositToCompleteModal
      isOpen={isModalOpen}
      onClose={cancelOperation}
      onResume={resumeOperation}
      creditsNeeded={creditsNeeded}
      operationName={options.operationName}
      progress={progress}
    />
  ), [isModalOpen, cancelOperation, resumeOperation, creditsNeeded, options.operationName, progress]);

  return {
    startOperation,
    updateProgress,
    resumeOperation,
    isPaused,
    progress,
    CreditModal
  };
}