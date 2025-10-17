'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { logger } from '@/lib/client-logger';
import {
  MessageCircle,
  Star,
  Send,
  X,
  ThumbsUp,
  ThumbsDown,
  Bug,
  Lightbulb,
  Heart,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

interface FeedbackData {
  type: 'rating' | 'feature_request' | 'bug_report' | 'general';
  rating?: number;
  message: string;
  category?: string;
  page: string;
  userAgent: string;
  timestamp: Date;
  context?: Record<string, any>;
}

interface FeedbackWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showOnPages?: string[];
  hideOnPages?: string[];
  contextData?: Record<string, any>;
}

export default function FeedbackWidget({
  position = 'bottom-right',
  showOnPages = [],
  hideOnPages = [],
  contextData = {}
}: FeedbackWidgetProps) {
  const { userId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'rating' | 'feature_request' | 'bug_report' | 'general'>('rating');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState('');

  useEffect(() => {
    setCurrentPage(window.location.pathname);
  }, []);

  // Check if widget should be shown on current page
  const shouldShow = () => {
    if (hideOnPages.length > 0 && hideOnPages.includes(currentPage)) return false;
    if (showOnPages.length > 0 && !showOnPages.includes(currentPage)) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && feedbackType !== 'rating') return;
    if (feedbackType === 'rating' && rating === 0) return;

    setIsSubmitting(true);

    try {
      const feedbackData: FeedbackData = {
        type: feedbackType,
        rating: feedbackType === 'rating' ? rating : undefined,
        message: message.trim(),
        category: category || undefined,
        page: currentPage,
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        context: {
          ...contextData,
          url: window.location.href,
          referrer: document.referrer,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      };

      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) throw new Error('Failed to submit feedback');

      setIsSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
        setMessage('');
        setRating(0);
        setCategory('');
        setFeedbackType('rating');
      }, 2000);

    } catch (error) {
      logger.error('system', 'Feedback submission error:', error );
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  if (!shouldShow()) return null;

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Feedback Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 group"
          aria-label="Open feedback widget"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Give Feedback
          </span>
        </button>
      )}

      {/* Feedback Panel */}
      {isOpen && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-80 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">Share Your Feedback</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {isSubmitted ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h4 className="text-white font-medium mb-1">Thank you!</h4>
                <p className="text-gray-400 text-sm">Your feedback helps us improve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Feedback Type Selection */}
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">
                    What would you like to share?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: 'rating', icon: Star, label: 'Rating', color: 'text-yellow-400' },
                      { type: 'feature_request', icon: Lightbulb, label: 'Idea', color: 'text-blue-400' },
                      { type: 'bug_report', icon: Bug, label: 'Bug', color: 'text-red-400' },
                      { type: 'general', icon: MessageCircle, label: 'General', color: 'text-gray-400' }
                    ].map(({ type, icon: Icon, label, color }) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFeedbackType(type as any)}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                          feedbackType === type
                            ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                            : 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${feedbackType === type ? 'text-purple-400' : color}`} />
                        <span className="text-sm">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating (if rating type) */}
                {feedbackType === 'rating' && (
                  <div>
                    <label className="text-gray-300 text-sm font-medium mb-2 block">
                      How would you rate your experience?
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-1 rounded transition-colors ${
                            star <= rating ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'
                          }`}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category (for feature requests and bugs) */}
                {(feedbackType === 'feature_request' || feedbackType === 'bug_report') && (
                  <div>
                    <label className="text-gray-300 text-sm font-medium mb-2 block">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Select category...</option>
                      {feedbackType === 'feature_request' ? (
                        <>
                          <option value="lighting">Lighting Features</option>
                          <option value="analytics">Analytics & Reports</option>
                          <option value="automation">Automation</option>
                          <option value="mobile">Mobile App</option>
                          <option value="integrations">Integrations</option>
                          <option value="ml">Machine Learning</option>
                          <option value="other">Other</option>
                        </>
                      ) : (
                        <>
                          <option value="ui">User Interface</option>
                          <option value="performance">Performance</option>
                          <option value="data">Data Issues</option>
                          <option value="calculations">Calculations</option>
                          <option value="login">Login/Auth</option>
                          <option value="mobile">Mobile Issues</option>
                          <option value="other">Other</option>
                        </>
                      )}
                    </select>
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">
                    {feedbackType === 'rating' 
                      ? 'Tell us more (optional)' 
                      : feedbackType === 'feature_request'
                      ? 'Describe your idea'
                      : feedbackType === 'bug_report'
                      ? 'Describe the issue'
                      : 'Your message'
                    }
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      feedbackType === 'rating'
                        ? "What did you like or dislike?"
                        : feedbackType === 'feature_request'
                        ? "What feature would help you grow better?"
                        : feedbackType === 'bug_report'
                        ? "What happened? What did you expect?"
                        : "Share your thoughts..."
                    }
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 resize-none"
                    required={feedbackType !== 'rating'}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || (feedbackType === 'rating' && rating === 0) || (feedbackType !== 'rating' && !message.trim())}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Feedback
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Quick Actions */}
          {!isSubmitted && (
            <div className="border-t border-gray-700 p-2">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                <span>Quick:</span>
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackType('rating');
                    setRating(5);
                  }}
                  className="flex items-center gap-1 hover:text-green-400 transition-colors"
                >
                  <ThumbsUp className="w-3 h-3" />
                  Love it
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackType('bug_report');
                    setMessage('');
                  }}
                  className="flex items-center gap-1 hover:text-red-400 transition-colors"
                >
                  <ThumbsDown className="w-3 h-3" />
                  Issue
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}