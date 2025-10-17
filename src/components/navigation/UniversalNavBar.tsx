'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ModuleNavigator } from './ModuleNavigator';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import {
  Home,
  ChevronRight,
  Menu,
  X,
  Bell,
  HelpCircle,
  User,
  LogOut,
  Settings,
  CreditCard,
  BarChart3,
  FileText,
  Sun,
  Moon,
  Command,
  Search
} from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function UniversalNavBar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(p => p);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];

    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const label = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        label,
        href: index === paths.length - 1 ? undefined : currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <nav 
      className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors lg:hidden"
              aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo/Home */}
            <Link 
              href="/" 
              className="flex items-center gap-2"
              aria-label="VibeLux Home"
            >
              <div 
                className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center"
                role="img"
                aria-label="VibeLux logo"
              >
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="hidden sm:inline text-white font-semibold">VibeLux</span>
            </Link>

            {/* Module Navigator */}
            <div className="hidden lg:block">
              <ModuleNavigator />
            </div>

            {/* Breadcrumbs - Desktop */}
            <nav 
              className="hidden lg:flex items-center gap-2 text-sm" 
              aria-label="Breadcrumb"
            >
              <ol className="flex items-center gap-2">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight className="w-4 h-4 text-gray-500" aria-hidden="true" />}
                    {crumb.href ? (
                      <Link 
                        href={crumb.href}
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-white font-medium" aria-current="page">
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button 
              onClick={() => setShowSearch(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 rounded-lg"
              aria-label="Open search"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-gray-700 rounded">⌘K</kbd>
            </button>

            {/* Mobile Search Button */}
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors sm:hidden"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              {hasNotifications && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Help */}
            <Link 
              href="/faq"
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
              aria-label="Help and FAQ"
            >
              <HelpCircle className="w-5 h-5" />
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg border border-gray-800 py-1">
                  <Link 
                    href="/account"
                    className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link 
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <Link 
                    href="/billing-dashboard"
                    className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />
                    Billing
                  </Link>
                  <Link 
                    href="/analytics"
                    className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Usage Stats
                  </Link>
                  <Link 
                    href="/docs"
                    className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Documentation
                  </Link>
                  <hr className="my-1 border-gray-800" />
                  <button className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full text-left">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs pb-2 lg:hidden overflow-x-auto">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-3 h-3 text-gray-500 flex-shrink-0" />}
              {crumb.href ? (
                <Link 
                  href={crumb.href}
                  className="text-gray-400 hover:text-white transition-colors whitespace-nowrap"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-white font-medium whitespace-nowrap">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="lg:hidden border-t border-gray-800"
          aria-labelledby="mobile-menu-button"
        >
          <div className="px-4 py-3">
            <ModuleNavigator />
          </div>
        </div>
      )}

      {/* Global Search */}
      <GlobalSearch 
        isOpen={showSearch} 
        onClose={() => setShowSearch(false)} 
      />
    </nav>
  );
}