'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Keyboard, Activity, Bug, Download, AlertTriangle, Zap } from 'lucide-react';

export function DebugGuide() {
  return (
    <div className="space-y-4 text-sm">
      <Card className="border-gray-700 bg-gray-900">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Bug className="w-5 h-5 text-purple-400" />
            Debug Mode Guide
          </CardTitle>
          <CardDescription>
            Tools to help diagnose and fix performance issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Performance Monitor */}
          <div>
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              Performance Monitor
            </h4>
            <div className="space-y-2 text-gray-300">
              <p>
                Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl+Shift+P</kbd> to toggle
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Real-time FPS tracking (target: 60fps)</li>
                <li>Render time measurements</li>
                <li>Memory usage monitoring</li>
                <li>Component count tracking</li>
                <li>Export performance reports</li>
              </ul>
            </div>
          </div>

          {/* Debug Panel */}
          <div>
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Bug className="w-4 h-4 text-purple-400" />
              Debug Panel
            </h4>
            <div className="space-y-2 text-gray-300">
              <p>
                Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl+Shift+D</kbd> to enable
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Event timeline with timestamps</li>
                <li>Action and calculation logging</li>
                <li>Error tracking with stack traces</li>
                <li>Performance measurements</li>
                <li>Export debug logs for support</li>
              </ul>
            </div>
          </div>

          {/* Performance Tips */}
          <div>
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Performance Tips
            </h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Badge className="bg-green-900/30 text-green-400 text-xs">TIP</Badge>
                <p className="text-gray-300 text-xs">Keep fixtures under 50 for smooth performance</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge className="bg-blue-900/30 text-blue-400 text-xs">TIP</Badge>
                <p className="text-gray-300 text-xs">Disable grid view when not actively designing</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge className="bg-purple-900/30 text-purple-400 text-xs">TIP</Badge>
                <p className="text-gray-300 text-xs">Use Chrome/Edge for best WebGL performance</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge className="bg-yellow-900/30 text-yellow-400 text-xs">TIP</Badge>
                <p className="text-gray-300 text-xs">Close other tabs to free up memory</p>
              </div>
            </div>
          </div>

          {/* Error Recovery */}
          <div>
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Error Recovery
            </h4>
            <div className="space-y-2 text-gray-300 text-xs">
              <p>If you encounter errors:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Check the Performance Monitor for high memory usage</li>
                <li>Export error report before refreshing</li>
                <li>Try reducing the number of fixtures</li>
                <li>Clear browser cache if issues persist</li>
                <li>Contact support with exported reports</li>
              </ol>
            </div>
          </div>

          {/* Reporting Issues */}
          <div className="pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-xs">
              When reporting issues, please include:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-gray-300 mt-2">
              <li>Performance report (from Performance Monitor)</li>
              <li>Debug log (from Debug Panel)</li>
              <li>Browser and OS information</li>
              <li>Steps to reproduce the issue</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}