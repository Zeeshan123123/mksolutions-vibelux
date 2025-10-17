'use client';

import { useState, useEffect } from 'react';
import { useIsOwner } from '@/hooks/useIsOwner';
import { Shield, Code, Terminal, Database, Activity, FileText, Settings, X, ChevronRight, MessageSquare, Users } from 'lucide-react';
import Link from 'next/link';
import { logger } from '@/lib/client-logger';

export function OwnerDevTools() {
  const { isOwner, isLoaded } = useIsOwner();
  const [isOpen, setIsOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    // Show badge after a delay if owner
    if (isLoaded && isOwner) {
      setTimeout(() => setShowBadge(true), 1000);
    }
  }, [isLoaded, isOwner]);

  // Keyboard shortcut for owners
  useEffect(() => {
    if (!isOwner) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + D
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOwner, isOpen]);

  if (!isLoaded || !isOwner) return null;

  const adminTools = [
    { href: '/admin', label: 'Admin Dashboard', icon: Shield, color: 'text-purple-400', description: 'User management & impersonation' },
    { href: '/admin/support', label: 'Customer Support', icon: MessageSquare, color: 'text-blue-400', description: 'View & assist customers', highlight: true },
    { href: '/developer-tools', label: 'Developer Console', icon: Terminal, color: 'text-green-400', description: 'API logs & database queries' },
    { href: '/control-center', label: 'Control Center', icon: Settings, color: 'text-blue-400', description: 'System configuration' },
    { href: '/admin/database', label: 'Database Manager', icon: Database, color: 'text-orange-400', description: 'Direct database access' },
    { href: '/admin/monitoring', label: 'System Monitoring', icon: Activity, color: 'text-red-400', description: 'Real-time metrics' },
    { href: '/admin/logs', label: 'Application Logs', icon: FileText, color: 'text-yellow-400', description: 'Error & debug logs' },
  ];

  return (
    <>
      {/* Owner Badge */}
      {showBadge && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
          title="Owner Tools (Cmd/Ctrl + Shift + D)"
        >
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">Owner</span>
          <Code className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      )}

      {/* Owner Tools Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 top-0 h-full w-80 bg-gray-900 shadow-2xl pointer-events-auto transform transition-transform duration-300">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  Owner Tools
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-400">
                Full system access • Production environment
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Quick Stats */}
              <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                <h3 className="text-sm font-medium text-gray-400 mb-3">System Status</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Environment</span>
                  <span className="text-green-400 font-mono">
                    {process.env.NODE_ENV || 'production'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Deploy Status</span>
                  <span className="text-green-400">Active</span>
                </div>
              </div>

              {/* Admin Tools */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Administrative Tools</h3>
                {adminTools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors group ${
                      tool.highlight 
                        ? 'bg-blue-900/20 border border-blue-500/30 hover:bg-blue-900/30' 
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <tool.icon className={`w-5 h-5 ${tool.color}`} />
                    <div className="flex-1">
                      <div className="text-white font-medium">{tool.label}</div>
                      <div className="text-xs text-gray-400">{tool.description}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                  </Link>
                ))}
              </div>

              {/* Debug Actions */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Actions</h3>
                <button
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    alert('Cache cleared! Refreshing page...');
                    window.location.reload();
                  }}
                  className="w-full p-3 rounded-lg bg-red-900/20 hover:bg-red-900/30 text-red-400 transition-colors text-left"
                >
                  Clear Cache & Reload
                </button>
                <button
                  onClick={() => {
                    logger.info('system', '=== SYSTEM INFO ===');
                    logger.info('system', 'User Agent:', { data: navigator.userAgent });
                    logger.info('system', 'Screen:', { data: window.screen });
                    logger.info('system', 'Window:', { data: { width: window.innerWidth, height: window.innerHeight } });
                    logger.info('system', 'Local Storage:', { data: localStorage });
                    logger.info('system', 'Session Storage:', { data: sessionStorage });
                    alert('System info logged to console');
                  }}
                  className="w-full p-3 rounded-lg bg-blue-900/20 hover:bg-blue-900/30 text-blue-400 transition-colors text-left"
                >
                  Log System Info
                </button>
              </div>

              {/* Keyboard Shortcut */}
              <div className="bg-purple-900/20 rounded-lg p-4">
                <p className="text-xs text-purple-300">
                  Press <kbd className="px-2 py-1 bg-purple-900/50 rounded text-purple-100">Cmd/Ctrl + Shift + D</kbd> to toggle this panel
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}