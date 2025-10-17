'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import { MobileNavigation } from '@/components/mobile/MobileNavigation';
import { PWAManager } from '@/components/pwa/PWAManager';
import {
  Bell,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Grid,
  List,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showPWAManager?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  className?: string;
}

type ViewportSize = 'mobile' | 'tablet' | 'desktop';
type LayoutMode = 'sidebar' | 'fullwidth' | 'compact';

export function ResponsiveLayout({
  children,
  title,
  description,
  showPWAManager = false,
  user,
  className = ''
}: ResponsiveLayoutProps) {
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('sidebar');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const checkViewportSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (width < 768) {
        setViewportSize('mobile');
        setLayoutMode('fullwidth');
      } else if (width < 1024) {
        setViewportSize('tablet');
        setLayoutMode('compact');
      } else {
        setViewportSize('desktop');
        setLayoutMode('sidebar');
      }

      setOrientation(height > width ? 'portrait' : 'landscape');
    };

    const handleResize = () => {
      checkViewportSize();
    };

    const handleOrientationChange = () => {
      setTimeout(checkViewportSize, 100); // Delay to ensure accurate dimensions
    };

    checkViewportSize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  useEffect(() => {
    // Auto-collapse sidebar on smaller screens
    if (viewportSize === 'tablet' && layoutMode === 'sidebar') {
      setSidebarCollapsed(true);
    } else if (viewportSize === 'desktop' && layoutMode === 'sidebar') {
      setSidebarCollapsed(false);
    }
  }, [viewportSize, layoutMode]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      logger.error('system', 'Fullscreen toggle failed:', error );
    }
  };

  const getContainerClasses = () => {
    const baseClasses = 'min-h-screen bg-gray-50 transition-all duration-300';
    
    switch (layoutMode) {
      case 'sidebar':
        return `${baseClasses} ${sidebarCollapsed ? 'pl-16' : 'pl-64'} transition-all duration-300`;
      case 'compact':
        return `${baseClasses} px-4`;
      case 'fullwidth':
        return `${baseClasses} pb-16`; // Bottom padding for mobile nav
      default:
        return baseClasses;
    }
  };

  const getContentClasses = () => {
    let classes = 'transition-all duration-300';
    
    // Responsive padding
    switch (viewportSize) {
      case 'mobile':
        classes += ' px-4 py-4';
        break;
      case 'tablet':
        classes += ' px-6 py-6';
        break;
      case 'desktop':
        classes += ' px-8 py-8';
        break;
    }

    // Layout-specific adjustments
    if (layoutMode === 'fullwidth' && viewportSize === 'mobile') {
      classes += ' pb-20'; // Extra bottom padding for mobile nav
    }

    return classes;
  };

  const renderViewportIndicator = () => {
    if (process.env.NODE_ENV !== 'development') return null;

    const getIcon = () => {
      switch (viewportSize) {
        case 'mobile': return <Smartphone className="w-4 h-4" />;
        case 'tablet': return <Tablet className="w-4 h-4" />;
        case 'desktop': return <Monitor className="w-4 h-4" />;
      }
    };

    return (
      <div className="fixed top-4 right-4 z-50 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-2">
        {getIcon()}
        <span>{viewportSize} • {orientation}</span>
        <span className="text-gray-300">
          {window.innerWidth}x{window.innerHeight}
        </span>
      </div>
    );
  };

  const renderLayoutControls = () => {
    if (viewportSize === 'mobile') return null;

    return (
      <div className="fixed top-4 left-4 z-40 flex items-center gap-2">
        {/* Layout Mode Toggles */}
        <div className="bg-white border border-gray-200 rounded-lg p-1 shadow-sm flex items-center">
          <button
            onClick={() => setLayoutMode('sidebar')}
            className={`p-2 rounded ${
              layoutMode === 'sidebar' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Sidebar Layout"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayoutMode('compact')}
            className={`p-2 rounded ${
              layoutMode === 'compact' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Compact Layout"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayoutMode('fullwidth')}
            className={`p-2 rounded ${
              layoutMode === 'fullwidth' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Full Width Layout"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Toggle */}
        {layoutMode === 'sidebar' && (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-600 hover:bg-gray-100"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-600 hover:bg-gray-100"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    );
  };

  const renderSidebar = () => {
    if (layoutMode !== 'sidebar' || viewportSize === 'mobile') return null;

    return (
      <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-30 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="p-4">
          {/* Logo */}
          <div className={`flex items-center gap-3 mb-8 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">VL</span>
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-xl text-gray-900">VibeLux</span>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2">
            {/* This would contain navigation items */}
            <div className="text-sm text-gray-500 mb-4">
              {sidebarCollapsed ? '' : 'Navigation items would go here'}
            </div>
          </nav>
        </div>

        {/* PWA Manager in Sidebar */}
        {showPWAManager && !sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200 mt-auto">
            <PWAManager />
          </div>
        )}
      </div>
    );
  };

  const renderHeader = () => {
    if (viewportSize === 'mobile') return null;

    return (
      <header className={`bg-white border-b border-gray-200 ${
        layoutMode === 'sidebar' ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : ''
      } transition-all duration-300`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              )}
              {description && (
                <p className="text-gray-600 mt-1">{description}</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Responsive indicators */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="hidden lg:inline">
                  {viewportSize} • {window.innerWidth}x{window.innerHeight}
                </span>
              </div>

              {/* User menu would go here */}
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  };

  return (
    <div className={`${getContainerClasses()} ${className}`}>
      {/* Development viewport indicator */}
      {renderViewportIndicator()}

      {/* Layout controls */}
      {renderLayoutControls()}

      {/* Sidebar */}
      {renderSidebar()}

      {/* Header */}
      {renderHeader()}

      {/* Mobile Navigation */}
      <MobileNavigation
        user={user}
        notificationCount={5}
        onUserMenuClick={() => logger.info('system', 'User menu clicked')}
      />

      {/* Main Content */}
      <main className={getContentClasses()}>
        {/* PWA Manager - Show at top on mobile/tablet if enabled */}
        {showPWAManager && viewportSize !== 'desktop' && (
          <div className="mb-6">
            <PWAManager />
          </div>
        )}

        {/* Page Content */}
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Safe area for mobile devices */}
      {viewportSize === 'mobile' && (
        <div className="h-4 bg-transparent" style={{ 
          paddingBottom: 'env(safe-area-inset-bottom)' 
        }} />
      )}

      {/* Mobile Menu Overlay */}
      {showMobileMenu && viewportSize === 'mobile' && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={() => setShowMobileMenu(false)}
        >
          <div className="fixed top-0 left-0 h-full w-80 max-w-[80vw] bg-white shadow-xl">
            {/* Mobile menu content would go here */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button onClick={() => setShowMobileMenu(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Menu items */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}