'use client';

import React from 'react';
import { 
  Lightbulb, 
  X, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { usePlantLightingSuggestions } from '../hooks/usePlantLightingSuggestions';

export function SmartLightingSuggestions() {
  const { suggestions, dismissSuggestion, dismissAll, hasSuggestions } = usePlantLightingSuggestions();

  if (!hasSuggestions) return null;

  return (
    <div className="absolute bottom-4 left-4 w-96 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-30 animate-slide-up">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <h3 className="text-sm font-semibold text-white">Smart Lighting Suggestions</h3>
        </div>
        <button
          onClick={dismissAll}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
          title="Dismiss all suggestions"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Suggestions List */}
      <div className="max-h-80 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="px-4 py-3 border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`mt-0.5 ${
                suggestion.type === 'interlighting' ? 'text-blue-400' :
                suggestion.type === 'under-canopy' ? 'text-purple-400' :
                'text-yellow-400'
              }`}>
                {suggestion.type === 'interlighting' ? (
                  <div className="relative">
                    <Lightbulb className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 text-xs">↕</span>
                  </div>
                ) : suggestion.type === 'under-canopy' ? (
                  <div className="relative">
                    <Lightbulb className="w-5 h-5" />
                    <span className="absolute -bottom-1 -right-1 text-xs">↓</span>
                  </div>
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className="text-sm text-white">
                  {suggestion.message}
                  {suggestion.message.includes('research verified') && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900 text-green-300">
                      Research Backed
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => {
                      suggestion.action();
                      dismissSuggestion(suggestion);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Apply
                  </button>
                  <button
                    onClick={() => dismissSuggestion(suggestion)}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Tip */}
      <div className="px-4 py-2 bg-gray-800/50 text-xs text-gray-400 flex items-center gap-1">
        <Lightbulb className="w-3 h-3" />
        Suggestions based on crop-specific lighting research
      </div>
    </div>
  );
}

// Animation styles
const styles = `
@keyframes slide-up {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}