'use client';

import { useState } from 'react';
import { useOperationCredits } from '@/hooks/useOperationCredits';
import { AIUsageTrackerV2 } from '@/lib/ai-usage-tracker-v2';

export function AIDesignerExample() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [userPrompt, setUserPrompt] = useState('');

  // Estimate credits based on prompt
  const estimation = AIUsageTrackerV2.estimateCredits(userPrompt);

  const {
    startOperation,
    updateProgress,
    resumeOperation,
    isPaused,
    progress,
    CreditModal
  } = useOperationCredits({
    type: 'aiDesigner',
    subType: estimation.type,
    operationName: 'AI Facility Design',
    estimatedCost: estimation.cost,
    onComplete: (result) => {
      setResult(result);
      setIsProcessing(false);
    },
    onCancel: () => {
      setIsProcessing(false);
    }
  });

  const handleDesignRequest = async () => {
    setIsProcessing(true);
    
    try {
      // Start the operation
      const { operationId, canProceed, creditsNeeded } = await startOperation();
      
      if (!canProceed) {
        alert(`You need ${creditsNeeded} credits to start this operation.`);
        setIsProcessing(false);
        return;
      }

      // Simulate AI processing with progress updates
      // In real implementation, this would be actual AI processing steps
      
      // Step 1: Analyze requirements (20%)
      await simulateProcessing();
      const step1Result = await updateProgress(20, { phase: 'analysis', data: {} });
      if (step1Result.paused) return;

      // Step 2: Generate layout (40%)
      await simulateProcessing();
      const step2Result = await updateProgress(40, { phase: 'layout', data: {} });
      if (step2Result.paused) return;

      // Step 3: Optimize placement (60%)
      await simulateProcessing();
      const step3Result = await updateProgress(60, { phase: 'optimization', data: {} });
      if (step3Result.paused) return;

      // Step 4: Calculate metrics (80%)
      await simulateProcessing();
      const step4Result = await updateProgress(80, { phase: 'metrics', data: {} });
      if (step4Result.paused) return;

      // Step 5: Finalize design (100%)
      await simulateProcessing();
      const finalResult = { design: 'completed', fixtures: [] };
      await updateProgress(100, finalResult);

    } catch (error) {
      console.error('Design generation failed:', error);
      setIsProcessing(false);
    }
  };

  const handleResume = async () => {
    try {
      const checkpoint = await resumeOperation();
      
      // Resume from checkpoint
      if (checkpoint?.phase === 'analysis') {
        // Continue from step 2
        await handleDesignRequest(); // This would resume from checkpoint
      }
      // ... handle other checkpoint phases
    } catch (error) {
      console.error('Failed to resume:', error);
    }
  };

  const simulateProcessing = () => new Promise(resolve => setTimeout(resolve, 1000));

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">AI Designer Example</h2>
      
      <textarea
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
        placeholder="Describe your facility design needs..."
        className="w-full h-32 p-3 bg-gray-800 rounded-lg mb-4"
      />

      <div className="mb-4 text-sm text-gray-400">
        Estimated cost: {estimation.cost} credits ({estimation.type} request)
      </div>

      <button
        onClick={handleDesignRequest}
        disabled={isProcessing || !userPrompt}
        className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg disabled:opacity-50"
      >
        {isProcessing ? `Processing... ${progress}%` : 'Generate Design'}
      </button>

      {/* Progress bar */}
      {isProcessing && (
        <div className="mt-4">
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Result display */}
      {result && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="font-bold mb-2">Design Complete!</h3>
          <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {/* Credit deposit modal */}
      <CreditModal />
    </div>
  );
}