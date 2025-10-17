'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { logger } from '@/lib/client-logger';
import {
  Home,
  BarChart3,
  Zap,
  Users,
  ShoppingCart,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  User,
  LogOut,
  HelpCircle,
  Bookmark,
  Download,
  Share2,
  Moon,
  Sun,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  active?: boolean;
  disabled?: boolean;
}

interface MobileNavigationProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onUserMenuClick?: () => void;
  notificationCount?: number;
  className?: string;
}

export function MobileNavigation({ 
  user, 
  onUserMenuClick, 
  notificationCount = 0,
  className = ''
}: MobileNavigationProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Close menu when route changes
    setIsMenuOpen(false);
  }, [pathname]);

  const mainNavItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      active: pathname === '/dashboard'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      active: pathname.startsWith('/analytics')
    },
    {
      id: 'design',
      label: 'AI Designer',
      href: '/design',
      icon: Zap,
      active: pathname.startsWith('/design')
    },
    {
      id: 'visualizations',
      label: 'Visualizations',
      href: '/visualizations',
      icon: BarChart3,
      active: pathname.startsWith('/visualizations')
    },
    {
      id: 'dashboards',
      label: 'Collaborative',
      href: '/dashboards',
      icon: Users,
      badge: '3',
      active: pathname.startsWith('/dashboards')
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      href: '/marketplace',
      icon: ShoppingCart,
      badge: 'New',
      active: pathname.startsWith('/marketplace')
    }
  ];

  const secondaryNavItems: NavigationItem[] = [
    {
      id: 'settings',
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      active: pathname.startsWith('/settings')
    },
    {
      id: 'help',
      label: 'Help & Support',
      href: '/help',
      icon: HelpCircle,
      active: pathname.startsWith('/help')
    },
    {
      id: 'bookmarks',
      label: 'Bookmarks',
      href: '/bookmarks',
      icon: Bookmark,
      active: pathname.startsWith('/bookmarks')
    }
  ];

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, this would toggle the theme
    document.documentElement.classList.toggle('dark');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const shareApp = async () => {
    const shareData = {
      title: 'VibeLux - Agricultural Technology',
      text: 'Check out VibeLux for AI-powered facility design!',
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('App URL copied to clipboard!');
      }
    } catch (error) {
      logger.error('system', 'Error sharing:', error );
    }
  };

  return (
    <>
      {/* Bottom Tab Bar - Mobile */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 ${className}`}>
        <div className="grid grid-cols-5 h-16">
          {mainNavItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 px-1 py-2 transition-colors ${
                  item.active 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge && (
                    <Badge 
                      className="absolute -top-2 -right-2 h-4 min-w-4 text-xs px-1 bg-red-500 text-white"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium truncate max-w-full">
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center justify-center gap-1 px-1 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <div className="relative">
              <Menu className="w-5 h-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-4 min-w-4 text-xs px-1 bg-red-500 text-white">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Badge>
              )}
            </div>
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="fixed right-0 top-0 h-full w-80 max-w-[80vw] bg-white shadow-xl transform transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.substring(0, 2).toUpperCase() || 'VL'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user?.name || 'VibeLux User'}</h3>
                  <p className="text-sm text-gray-600">{user?.email || 'user@vibelux.ai'}</p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </form>
              </div>

              {/* Status */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isOnline ? (
                      <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm text-gray-600">
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="p-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Main Navigation
                  </h4>
                  {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          item.active 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge className="ml-auto bg-blue-100 text-blue-700">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>

                <div className="space-y-1 mt-6">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    More Options
                  </h4>
                  {secondaryNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          item.active 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <div className="space-y-1 mt-6">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Quick Actions
                  </h4>
                  
                  <button
                    onClick={shareApp}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="font-medium">Share App</span>
                  </button>

                  {notificationCount > 0 && (
                    <Link
                      href="/notifications"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                    >
                      <Bell className="w-5 h-5" />
                      <span className="font-medium">Notifications</span>
                      <Badge className="ml-auto bg-red-100 text-red-700">
                        {notificationCount}
                      </Badge>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4">
              <div className="space-y-2">
                <button
                  onClick={onUserMenuClick}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 w-full"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </button>
                
                <button className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-red-600 hover:bg-red-50 w-full">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">VibeLux v1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Top Bar - Tablet and larger */}
      <div className="hidden md:block bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VL</span>
                </div>
                <span className="font-bold text-xl text-gray-900">VibeLux</span>
              </Link>

              <nav className="hidden lg:flex items-center gap-1">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        item.active 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge className="ml-1 bg-blue-100 text-blue-700 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Search - Hidden on small screens */}
              <div className="hidden lg:block">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </form>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-5 text-xs px-1 bg-red-500 text-white">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Badge>
                )}
              </button>

              {/* User Menu */}
              <button
                onClick={onUserMenuClick}
                className="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {user?.name?.substring(0, 2).toUpperCase() || 'VL'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}