'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Bug, 
  Send, 
  Copy, 
  Check, 
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { errorContextCollector, type ErrorContext } from '@/lib/debugging/error-context';
import { toast } from '@/components/ui/use-toast';

interface ErrorReporterProps {
  error: Error;
  resetError?: () => void;
  context?: ErrorContext;
}

export function ErrorReporter({ error, resetError, context }: ErrorReporterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);
  const [userDescription, setUserDescription] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const errorContext = context || errorContextCollector?.collectContext(error);
  
  const handleSendReport = async () => {
    setIsSending(true);
    
    try {
      const reportData = {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        context: errorContext,
        userFeedback: {
          description: userDescription,
          email: userEmail,
          reportedAt: new Date().toISOString()
        }
      };
      
      // Send to your error tracking service
      const response = await fetch('/api/error-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      
      if (response.ok) {
        toast({
          title: 'Report Sent',
          description: 'Thank you for helping us improve Vibelux!',
        });
        
        // Also log to console for debugging
        console.log('Error Report:', reportData);
        
        // Reset after successful send
        if (resetError) {
          setTimeout(resetError, 2000);
        }
      } else {
        throw new Error('Failed to send report');
      }
    } catch (err) {
      // Fallback: Copy to clipboard
      handleCopyDebugInfo();
      toast({
        title: 'Report copied to clipboard',
        description: 'Please email it to support@vibelux.com',
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleCopyDebugInfo = () => {
    const debugInfo = generateDebugReport();
    navigator.clipboard.writeText(debugInfo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleDownloadReport = () => {
    const debugInfo = generateDebugReport();
    const blob = new Blob([debugInfo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibelux-error-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const generateDebugReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      context: errorContext,
      userFeedback: {
        description: userDescription,
        email: userEmail
      }
    };
    
    return JSON.stringify(report, null, 2);
  };
  
  const getSuggestions = () => {
    const suggestions = [];
    
    if (errorContext?.type === '404') {
      suggestions.push({
        icon: '🔍',
        text: 'The page or resource you\'re looking for doesn\'t exist',
        action: 'Try going back to the dashboard'
      });
    }
    
    if (errorContext?.type === 'network') {
      suggestions.push({
        icon: '🌐',
        text: 'Network connection issue detected',
        action: 'Check your internet connection and try again'
      });
    }
    
    if (errorContext?.type === 'permission') {
      suggestions.push({
        icon: '🔒',
        text: 'You don\'t have permission to access this resource',
        action: 'Make sure you\'re logged in with the correct account'
      });
    }
    
    if (error.message.includes('memory')) {
      suggestions.push({
        icon: '💾',
        text: 'Your browser might be running out of memory',
        action: 'Try closing other tabs or refreshing the page'
      });
    }
    
    return suggestions;
  };
  
  const suggestions = getSuggestions();
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-red-900 bg-opacity-50 p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Oops! Something went wrong</h1>
              <p className="text-red-200 mt-1">
                We\'re sorry about this. Your work has been saved locally.
              </p>
            </div>
          </div>
        </div>
        
        {/* Error Info */}
        <div className="p-6 space-y-4">
          {/* Quick Actions */}
          <div className="flex gap-3">
            <button
              onClick={resetError}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
            >
              Go to Dashboard
            </button>
          </div>
          
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4">
              <h3 className="font-semibold mb-2">What might have happened:</h3>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="text-2xl">{suggestion.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{suggestion.text}</p>
                      <p className="text-xs text-gray-400">{suggestion.action}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Error Details */}
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Error Details</h3>
              <button
                onClick={() => setShowTechnical(!showTechnical)}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
              >
                {showTechnical ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showTechnical ? 'Hide' : 'Show'} Technical
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-400">Error:</span>{' '}
                <span className="font-mono">{error.message}</span>
              </div>
              {errorContext && (
                <>
                  <div>
                    <span className="text-gray-400">Location:</span>{' '}
                    <span className="font-mono">{errorContext.route}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Time:</span>{' '}
                    <span>{new Date(errorContext.timestamp).toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
            
            {showTechnical && error.stack && (
              <pre className="mt-3 p-3 bg-gray-800 rounded text-xs overflow-x-auto">
                {error.stack}
              </pre>
            )}
          </div>
          
          {/* Report Form */}
          <div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium"
            >
              <Bug className="w-4 h-4" />
              Help us fix this issue
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {isExpanded && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    What were you trying to do? (optional)
                  </label>
                  <textarea
                    value={userDescription}
                    onChange={(e) => setUserDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md resize-none"
                    rows={3}
                    placeholder="I was trying to..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email (optional, for follow-up)
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"
                    placeholder="your@email.com"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleSendReport}
                    disabled={isSending}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-md font-medium flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {isSending ? 'Sending...' : 'Send Report'}
                  </button>
                  
                  <button
                    onClick={handleCopyDebugInfo}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  
                  <button
                    onClick={handleDownloadReport}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                    title="Download debug report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Debug Info Preview */}
          {errorContext && (
            <details className="text-xs text-gray-400">
              <summary className="cursor-pointer hover:text-gray-300">
                Debug Information ({errorContext.breadcrumbs.length} breadcrumbs, {errorContext.lastApiCalls.length} API calls)
              </summary>
              <div className="mt-2 space-y-2">
                <div>
                  <strong>Session:</strong> {errorContext.sessionId}
                </div>
                <div>
                  <strong>Browser:</strong> {errorContext.browser.name} {errorContext.browser.version}
                </div>
                {errorContext.memory && (
                  <div>
                    <strong>Memory:</strong> {errorContext.memory.used}MB / {errorContext.memory.total}MB
                  </div>
                )}
                <div>
                  <strong>Last Actions:</strong>
                  <ul className="mt-1 space-y-1">
                    {errorContext.breadcrumbs.slice(-5).map((crumb, idx) => (
                      <li key={idx} className="ml-4">
                        • {crumb.type}: {crumb.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}