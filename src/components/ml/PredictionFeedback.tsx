'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, CheckCircle } from 'lucide-react';
import { learningSystem } from '@/lib/ml/continuous-learning-system';

interface PredictionFeedbackProps {
  predictionId: string;
  facilityId: string;
  predictedYield?: number;
  onFeedbackSubmitted?: () => void;
}

export function PredictionFeedback({ 
  predictionId, 
  facilityId,
  predictedYield,
  onFeedbackSubmitted 
}: PredictionFeedbackProps) {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [actualYield, setActualYield] = useState('');
  const [quality, setQuality] = useState<'A' | 'B' | 'C'>('A');
  const [accuracy, setAccuracy] = useState(3);
  const [useful, setUseful] = useState<boolean | null>(null);
  const [notes, setNotes] = useState('');

  const handleQuickFeedback = async (isUseful: boolean) => {
    try {
      await learningSystem.recordFeedback(predictionId, {
        accuracy: isUseful ? 4 : 2,
        useful: isUseful,
      });
      setUseful(isUseful);
      if (!isUseful) setShowForm(true);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleDetailedFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Record actual result if provided
      if (actualYield) {
        await learningSystem.recordActualResult(facilityId, predictionId, {
          yield: parseFloat(actualYield),
          quality,
          harvestDate: new Date(),
          notes
        });
      }
      
      // Record feedback
      await learningSystem.recordFeedback(predictionId, {
        accuracy,
        useful: useful !== null ? useful : accuracy >= 3,
        improvements: notes
      });
      
      setSubmitted(true);
      onFeedbackSubmitted?.();
      
      // Hide after 3 seconds
      setTimeout(() => {
        setShowForm(false);
        setSubmitted(false);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to submit detailed feedback:', error);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 rounded-lg p-4 flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <div>
          <p className="font-medium text-green-900">Thank you for your feedback!</p>
          <p className="text-sm text-green-700">
            Your data helps improve predictions for all VibeLux users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Feedback */}
      {useful === null && !showForm && (
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
          <span className="text-sm text-gray-700">Was this prediction helpful?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuickFeedback(true)}
              className="p-2 hover:bg-green-100 rounded-lg transition-colors group"
              title="Yes, helpful"
            >
              <ThumbsUp className="h-4 w-4 text-gray-600 group-hover:text-green-600" />
            </button>
            <button
              onClick={() => handleQuickFeedback(false)}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
              title="Not helpful"
            >
              <ThumbsDown className="h-4 w-4 text-gray-600 group-hover:text-red-600" />
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="p-2 hover:bg-blue-100 rounded-lg transition-colors group"
              title="Add details"
            >
              <MessageSquare className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
            </button>
          </div>
        </div>
      )}

      {/* Detailed Feedback Form */}
      {showForm && (
        <form onSubmit={handleDetailedFeedback} className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">Help us improve predictions</h4>
          
          {/* Actual Yield */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actual Yield (kg/m²) - Optional
            </label>
            <input
              type="number"
              step="0.1"
              value={actualYield}
              onChange={(e) => setActualYield(e.target.value)}
              placeholder={predictedYield ? `Predicted: ${predictedYield.toFixed(1)}` : 'Enter actual yield'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Quality */}
          {actualYield && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harvest Quality
              </label>
              <div className="flex gap-2">
                {(['A', 'B', 'C'] as const).map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => setQuality(grade)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      quality === grade
                        ? 'bg-purple-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Grade {grade}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Accuracy Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prediction Accuracy
            </label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Poor</span>
              <input
                type="range"
                min="1"
                max="5"
                value={accuracy}
                onChange={(e) => setAccuracy(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-500">Excellent</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any factors that might have affected the outcome?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      )}
    </div>
  );
}