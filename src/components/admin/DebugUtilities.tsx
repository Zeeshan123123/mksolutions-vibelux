'use client';

import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Database, 
  Settings, 
  Users, 
  RefreshCw,
  Download,
  Trash2,
  Play,
  AlertTriangle,
  CheckCircle,
  Code,
  Server,
  Eye,
  Copy
} from 'lucide-react';

interface DebugCommand {
  id: string;
  name: string;
  description: string;
  category: 'database' | 'cache' | 'system' | 'user' | 'api';
  command: string;
  dangerous?: boolean;
}

interface DebugResult {
  success: boolean;
  output: string;
  error?: string;
  executedAt: Date;
  executionTime: number;
}

export function DebugUtilities() {
  const [selectedCategory, setSelectedCategory] = useState<string>('system');
  const [commandHistory, setCommandHistory] = useState<Array<{ command: string; result: DebugResult }>>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [customCommand, setCustomCommand] = useState('');

  const debugCommands: DebugCommand[] = [
    // System Commands
    {
      id: 'system-info',
      name: 'System Information',
      description: 'Get system resource usage and environment info',
      category: 'system',
      command: 'system-info'
    },
    {
      id: 'memory-usage',
      name: 'Memory Usage',
      description: 'Display detailed memory usage statistics',
      category: 'system',
      command: 'memory-usage'
    },
    {
      id: 'environment-vars',
      name: 'Environment Variables',
      description: 'List all environment variables (sensitive data masked)',
      category: 'system',
      command: 'env-vars'
    },
    
    // Database Commands
    {
      id: 'db-status',
      name: 'Database Status',
      description: 'Check database connection and performance',
      category: 'database',
      command: 'db-status'
    },
    {
      id: 'db-tables',
      name: 'List Tables',
      description: 'Show all database tables and row counts',
      category: 'database',
      command: 'db-tables'
    },
    {
      id: 'db-connections',
      name: 'Active Connections',
      description: 'Show active database connections',
      category: 'database',
      command: 'db-connections'
    },
    {
      id: 'db-slow-queries',
      name: 'Slow Queries',
      description: 'Identify slow-running database queries',
      category: 'database',
      command: 'db-slow-queries'
    },
    
    // User Commands
    {
      id: 'user-stats',
      name: 'User Statistics',
      description: 'Get user registration and activity statistics',
      category: 'user',
      command: 'user-stats'
    },
    {
      id: 'active-sessions',
      name: 'Active Sessions',
      description: 'Show currently active user sessions',
      category: 'user',
      command: 'active-sessions'
    },
    {
      id: 'user-errors',
      name: 'User Error Reports',
      description: 'Get recent user-reported errors',
      category: 'user',
      command: 'user-errors'
    },
    
    // API Commands
    {
      id: 'api-health',
      name: 'API Health Check',
      description: 'Test all API endpoints for availability',
      category: 'api',
      command: 'api-health'
    },
    {
      id: 'api-performance',
      name: 'API Performance',
      description: 'Get API response time metrics',
      category: 'api',
      command: 'api-performance'
    },
    {
      id: 'rate-limits',
      name: 'Rate Limit Status',
      description: 'Check current rate limiting status',
      category: 'api',
      command: 'rate-limits'
    },
    
    // Cache Commands
    {
      id: 'cache-status',
      name: 'Cache Status',
      description: 'Check cache system status and hit rates',
      category: 'cache',
      command: 'cache-status'
    },
    {
      id: 'cache-clear',
      name: 'Clear Cache',
      description: 'Clear all cached data',
      category: 'cache',
      command: 'cache-clear',
      dangerous: true
    },
    
    // Dangerous Commands
    {
      id: 'restart-services',
      name: 'Restart Services',
      description: 'Restart background services',
      category: 'system',
      command: 'restart-services',
      dangerous: true
    }
  ];

  const categories = [
    { id: 'system', name: 'System', icon: Server },
    { id: 'database', name: 'Database', icon: Database },
    { id: 'user', name: 'Users', icon: Users },
    { id: 'api', name: 'API', icon: Code },
    { id: 'cache', name: 'Cache', icon: RefreshCw }
  ];

  const executeCommand = async (command: string) => {
    setIsExecuting(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch('/api/admin/debug/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      
      const data = await response.json();
      const executionTime = Date.now() - startTime;
      
      const result: DebugResult = {
        success: response.ok,
        output: data.output || JSON.stringify(data, null, 2),
        error: data.error,
        executedAt: new Date(),
        executionTime
      };
      
      setCommandHistory(prev => [
        { command, result },
        ...prev.slice(0, 19) // Keep last 20 commands
      ]);
      
    } catch (error) {
      const result: DebugResult = {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        executedAt: new Date(),
        executionTime: Date.now() - startTime
      };
      
      setCommandHistory(prev => [
        { command, result },
        ...prev.slice(0, 19)
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const filteredCommands = debugCommands.filter(cmd => cmd.category === selectedCategory);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadLogs = () => {
    const logsData = commandHistory.map(item => ({
      command: item.command,
      success: item.result.success,
      output: item.result.output,
      error: item.result.error,
      executedAt: item.result.executedAt.toISOString(),
      executionTime: item.result.executionTime
    }));
    
    const blob = new Blob([JSON.stringify(logsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Debug Utilities</h1>
          <p className="text-gray-600">System debugging and diagnostic tools</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={downloadLogs}
            disabled={commandHistory.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export Logs</span>
          </button>
          
          <button
            onClick={() => setCommandHistory([])}
            disabled={commandHistory.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Command Categories */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">Categories</h2>
          <div className="space-y-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const commandCount = debugCommands.filter(cmd => cmd.category === category.id).length;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'hover:bg-gray-50 border-gray-200'
                  } border`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{commandCount}</span>
                </button>
              );
            })}
          </div>
          
          {/* Custom Command */}
          <div className="mt-6 pt-4 border-t">
            <h3 className="font-medium mb-2">Custom Command</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={customCommand}
                onChange={(e) => setCustomCommand(e.target.value)}
                placeholder="Enter custom command..."
                className="flex-1 px-3 py-2 border rounded text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && customCommand.trim()) {
                    executeCommand(customCommand);
                    setCustomCommand('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (customCommand.trim()) {
                    executeCommand(customCommand);
                    setCustomCommand('');
                  }
                }}
                disabled={isExecuting || !customCommand.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Available Commands */}
        <div className="bg-white rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">Available Commands</h2>
          <div className="space-y-2">
            {filteredCommands.map((command) => (
              <div
                key={command.id}
                className="p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{command.name}</h3>
                  <div className="flex items-center space-x-2">
                    {command.dangerous && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    <button
                      onClick={() => executeCommand(command.command)}
                      disabled={isExecuting}
                      className={`px-2 py-1 text-xs rounded ${
                        command.dangerous
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      } disabled:opacity-50`}
                    >
                      {isExecuting ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-600">{command.description}</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 block">
                  {command.command}
                </code>
              </div>
            ))}
          </div>
        </div>

        {/* Command History & Output */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Command History</h2>
              <span className="text-sm text-gray-500">
                {commandHistory.length} commands
              </span>
            </div>
          </div>
          
          <div className="p-4 max-h-96 overflow-y-auto">
            {commandHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Terminal className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No commands executed yet</p>
                <p className="text-sm">Select a command to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {commandHistory.map((item, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 ${
                      item.result.success ? 'border-green-200' : 'border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {item.result.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {item.command}
                        </code>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{item.result.executionTime}ms</span>
                        <button
                          onClick={() => copyToClipboard(item.result.output)}
                          className="hover:text-gray-700"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-2">
                      {item.result.executedAt.toLocaleString()}
                    </div>
                    
                    {item.result.error ? (
                      <div className="bg-red-50 border border-red-200 rounded p-2">
                        <pre className="text-xs text-red-700 whitespace-pre-wrap">
                          {item.result.error}
                        </pre>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border rounded p-2 max-h-32 overflow-y-auto">
                        <pre className="text-xs whitespace-pre-wrap">
                          {item.result.output}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}