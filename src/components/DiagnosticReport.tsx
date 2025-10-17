'use client';

import { useState } from 'react';
import { logger } from '@/lib/client-logger';
import { 
  Download, 
  Mail, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Copy, 
  Loader2,
  Monitor,
  Database,
  Wifi,
  Cpu,
  HardDrive,
  Globe
} from 'lucide-react';

interface DiagnosticData {
  timestamp: string;
  userAgent: string;
  url: string;
  errorDetails?: {
    message: string;
    stack?: string;
    componentStack?: string;
  };
  systemInfo: {
    browser: string;
    os: string;
    screenResolution: string;
    viewport: string;
    connectionType: string;
    language: string;
    timezone: string;
  };
  appState: {
    currentPage: string;
    userAuthenticated: boolean;
    lastAction: string;
    sessionDuration: number;
    featureFlags: Record<string, boolean>;
  };
  performanceMetrics: {
    pageLoadTime: number;
    memoryUsage: number;
    connectionSpeed: string;
    renderTime: number;
  };
  consoleErrors: string[];
  networkRequests: Array<{
    url: string;
    method: string;
    status: number;
    responseTime: number;
    timestamp: string;
  }>;
}

interface DiagnosticReportProps {
  errorInfo?: {
    message: string;
    stack?: string;
    componentStack?: string;
  };
  onClose?: () => void;
}

export function DiagnosticReport({ errorInfo, onClose }: DiagnosticReportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<DiagnosticData | null>(null);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateDiagnosticReport = async () => {
    setIsGenerating(true);
    
    try {
      // Collect system information
      const systemInfo = {
        browser: navigator.userAgent,
        os: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        connectionType: (navigator as any).connection?.effectiveType || 'unknown',
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      // Collect performance metrics
      const performanceMetrics = {
        pageLoadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
        connectionSpeed: (navigator as any).connection?.downlink || 0,
        renderTime: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
      };

      // Collect console errors from session storage
      const consoleErrors = JSON.parse(sessionStorage.getItem('consoleErrors') || '[]');

      // Collect recent network requests
      const networkRequests = JSON.parse(sessionStorage.getItem('networkRequests') || '[]');

      // Collect app state
      const appState = {
        currentPage: window.location.pathname,
        userAuthenticated: !!localStorage.getItem('auth_token'),
        lastAction: sessionStorage.getItem('lastUserAction') || 'unknown',
        sessionDuration: Date.now() - parseInt(sessionStorage.getItem('sessionStart') || '0'),
        featureFlags: JSON.parse(localStorage.getItem('featureFlags') || '{}')
      };

      const diagnosticData: DiagnosticData = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        errorDetails: errorInfo,
        systemInfo,
        appState,
        performanceMetrics,
        consoleErrors,
        networkRequests: networkRequests.slice(-10) // Last 10 requests
      };

      setReportData(diagnosticData);
      setReportGenerated(true);
      
      // Send to backend for processing
      await fetch('/api/diagnostic-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diagnosticData)
      });

    } catch (error) {
      logger.error('system', 'Failed to generate diagnostic report:', error );
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!reportData) return;

    const reportContent = `
VIBELUX DIAGNOSTIC REPORT
Generated: ${reportData.timestamp}
Report ID: ${Date.now()}-${Math.random().toString(36).substr(2, 9)}

═══════════════════════════════════════════════════════════════════════════════

ERROR DETAILS:
${errorInfo ? `
Message: ${errorInfo.message}
Stack Trace: ${errorInfo.stack || 'Not available'}
Component Stack: ${errorInfo.componentStack || 'Not available'}
` : 'No error details provided'}

SYSTEM INFORMATION:
Browser: ${reportData.systemInfo.browser}
Operating System: ${reportData.systemInfo.os}
Screen Resolution: ${reportData.systemInfo.screenResolution}
Viewport: ${reportData.systemInfo.viewport}
Connection Type: ${reportData.systemInfo.connectionType}
Language: ${reportData.systemInfo.language}
Timezone: ${reportData.systemInfo.timezone}

APPLICATION STATE:
Current Page: ${reportData.appState.currentPage}
User Authenticated: ${reportData.appState.userAuthenticated}
Last Action: ${reportData.appState.lastAction}
Session Duration: ${Math.round(reportData.appState.sessionDuration / 1000)}s
Feature Flags: ${JSON.stringify(reportData.appState.featureFlags, null, 2)}

PERFORMANCE METRICS:
Page Load Time: ${reportData.performanceMetrics.pageLoadTime}ms
Memory Usage: ${Math.round(reportData.performanceMetrics.memoryUsage / 1024 / 1024)}MB
Connection Speed: ${reportData.performanceMetrics.connectionSpeed}Mbps
Render Time: ${reportData.performanceMetrics.renderTime}ms

CONSOLE ERRORS:
${reportData.consoleErrors.length > 0 ? reportData.consoleErrors.join('\n') : 'No console errors recorded'}

RECENT NETWORK REQUESTS:
${reportData.networkRequests.map(req => 
  `${req.timestamp} - ${req.method} ${req.url} - ${req.status} (${req.responseTime}ms)`
).join('\n')}

═══════════════════════════════════════════════════════════════════════════════
End of Report
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibelux-diagnostic-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyReport = async () => {
    if (!reportData) return;
    
    const reportContent = JSON.stringify(reportData, null, 2);
    await navigator.clipboard.writeText(reportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const emailReport = () => {
    const subject = encodeURIComponent('VibeLux Diagnostic Report');
    const body = encodeURIComponent(`
Hi VibeLux Support,

I encountered an issue and have generated a diagnostic report. Please see the attached report file.

${errorInfo ? `Error Message: ${errorInfo.message}` : 'No specific error message'}

Please let me know if you need any additional information.

Best regards
    `);
    
    window.open(`mailto:support@vibelux.com?subject=${subject}&body=${body}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Diagnostic Report</h2>
              <p className="text-sm text-gray-400">Generate a detailed report to help us resolve your issue</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2"
            >
              ×
            </button>
          )}
        </div>

        {errorInfo && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-400 mb-1">Error Detected</h3>
                <p className="text-sm text-red-300 font-mono">{errorInfo.message}</p>
              </div>
            </div>
          </div>
        )}

        {!reportGenerated ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-white">System Info</span>
                </div>
                <p className="text-sm text-gray-400">Browser, OS, screen resolution</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-4 h-4 text-green-400" />
                  <span className="font-medium text-white">Performance</span>
                </div>
                <p className="text-sm text-gray-400">Load times, memory usage</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  <span className="font-medium text-white">App State</span>
                </div>
                <p className="text-sm text-gray-400">Current page, user session</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="w-4 h-4 text-yellow-400" />
                  <span className="font-medium text-white">Network</span>
                </div>
                <p className="text-sm text-gray-400">Recent requests, connection</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">What's Included</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• System information (browser, OS, screen resolution)</li>
                <li>• Performance metrics (load times, memory usage)</li>
                <li>• Application state (current page, user session)</li>
                <li>• Recent network requests and errors</li>
                <li>• Console errors and debugging information</li>
              </ul>
            </div>

            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-400 mb-1">Privacy Notice</h3>
                  <p className="text-sm text-blue-300">
                    This report contains technical information only. No personal data, passwords, or sensitive information is included.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={generateDiagnosticReport}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Diagnostic Report
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <h3 className="font-medium text-green-400">Report Generated Successfully</h3>
                  <p className="text-sm text-green-300">Your diagnostic report is ready. Choose how you'd like to share it:</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={downloadReport}
                className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg flex items-center gap-3 transition-colors"
              >
                <Download className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <div className="font-medium">Download</div>
                  <div className="text-sm text-gray-400">Save as .txt file</div>
                </div>
              </button>

              <button
                onClick={emailReport}
                className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg flex items-center gap-3 transition-colors"
              >
                <Mail className="w-5 h-5 text-green-400" />
                <div className="text-left">
                  <div className="font-medium">Email</div>
                  <div className="text-sm text-gray-400">Send to support</div>
                </div>
              </button>

              <button
                onClick={copyReport}
                className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg flex items-center gap-3 transition-colors"
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-purple-400" />
                )}
                <div className="text-left">
                  <div className="font-medium">{copied ? 'Copied!' : 'Copy'}</div>
                  <div className="text-sm text-gray-400">To clipboard</div>
                </div>
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">Report Summary</h3>
              <div className="text-sm text-gray-400 space-y-1">
                <div>Generated: {reportData?.timestamp}</div>
                <div>Browser: {reportData?.systemInfo.browser.split(' ')[0]}</div>
                <div>Page: {reportData?.appState.currentPage}</div>
                <div>Errors: {reportData?.consoleErrors.length || 0}</div>
                <div>Network Requests: {reportData?.networkRequests.length || 0}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}