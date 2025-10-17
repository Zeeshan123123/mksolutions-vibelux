'use client';

import React, { useState, useEffect } from 'react';
import { UniversalNavBar } from './UniversalNavBar';
import { QuickAccessSidebar } from './QuickAccessSidebar';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { AccessibilityProvider, SkipNavLink } from '@/components/accessibility/AccessibilityProvider';
import { KeyboardNavigation } from '@/components/accessibility/KeyboardNavigation';
import { NotificationProvider } from '@/components/ui/NotificationSystem';
import '@/components/accessibility/AccessibilityStyles.css';

interface NavigationLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function NavigationLayout({ children, showSidebar = true }: NavigationLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar state changes
  useEffect(() => {
    const checkSidebarState = () => {
      const collapsed = localStorage.getItem('sidebar-collapsed') === 'true';
      setSidebarCollapsed(collapsed);
    };

    checkSidebarState();
    
    // Listen for storage changes
    window.addEventListener('storage', checkSidebarState);
    
    // Custom event for sidebar toggle
    window.addEventListener('sidebar-toggle', checkSidebarState);
    
    return () => {
      window.removeEventListener('storage', checkSidebarState);
      window.removeEventListener('sidebar-toggle', checkSidebarState);
    };
  }, []);

  return (
    <AccessibilityProvider>
      <NotificationProvider>
        <KeyboardNavigation>
          <div className="min-h-screen bg-gray-950">
            <SkipNavLink />
            
            <ErrorBoundary>
              <UniversalNavBar />
            </ErrorBoundary>
            
            <div className="flex">
              {showSidebar && (
                <ErrorBoundary fallback={<div className="w-16 bg-gray-900" />}>
                  <QuickAccessSidebar />
                </ErrorBoundary>
              )}
              
              <main 
                id="main-content"
                className={`flex-1 transition-all duration-300 ${
                  showSidebar ? (sidebarCollapsed ? 'ml-16' : 'ml-64') : ''
                }`}
                role="main"
                aria-label="Main content"
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                </div>
              </main>
            </div>
          </div>
        </KeyboardNavigation>
      </NotificationProvider>
    </AccessibilityProvider>
  );
}