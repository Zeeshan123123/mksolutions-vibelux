'use client';

import { useState, useEffect } from 'react';
import { Brain, TrendingUp, Users, Award, BarChart3 } from 'lucide-react';
import { learningSystem } from '@/lib/ml/continuous-learning-system';

interface LearningInsightsPanelProps {
  facilityId: string;
}

export function LearningInsightsPanel({ facilityId }: LearningInsightsPanelProps) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, [facilityId]);

  const loadInsights = async () => {
    try {
      const data = await learningSystem.getLearningInsights(facilityId);
      setInsights(data);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-100 rounded-lg h-48" />;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold">AI Learning Progress</h3>
        </div>
        <span className="text-sm text-gray-500">
          Continuously improving with your data
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Predictions */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span className="text-2xl font-bold text-purple-700">
              {insights?.totalPredictions || 0}
            </span>
          </div>
          <p className="text-sm text-purple-600">Total Predictions</p>
        </div>

        {/* Verified Results */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Award className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold text-green-700">
              {insights?.predictionsWithActuals || 0}
            </span>
          </div>
          <p className="text-sm text-green-600">Verified Results</p>
        </div>

        {/* Accuracy */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-2xl font-bold text-blue-700">
              {(insights?.averageAccuracy || 0).toFixed(0)}%
            </span>
          </div>
          <p className="text-sm text-blue-600">Avg Accuracy</p>
        </div>

        {/* Model Improvements */}
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-orange-600" />
            <span className="text-2xl font-bold text-orange-700">
              {insights?.modelImprovements || 0}
            </span>
          </div>
          <p className="text-sm text-orange-600">Model Updates</p>
        </div>
      </div>

      {/* Top Impact Factors */}
      {insights?.topFactors && insights.topFactors.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Key Success Factors (from network learning)
          </h4>
          <div className="space-y-2">
            {insights.topFactors.map((factor: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{factor.factor}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${factor.impact}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-10 text-right">
                    {factor.impact}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Network Learning Status */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600">
              Learning from {insights?.totalPredictions || 0} VibeLux facilities worldwide
            </span>
          </div>
          <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}