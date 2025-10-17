'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Activity,
  BarChart3,
  Leaf,
  Calculator,
  Settings,
  Plus,
  Search,
  Star,
  Clock,
  PanelLeftOpen,
  PanelLeftClose
} from 'lucide-react';

interface QuickLink {
  id: string;
  label: string;
  href: string;
  icon: any;
  color: string;
}

const defaultQuickLinks: QuickLink[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'text-blue-400' },
  { id: 'cultivation', label: 'Cultivation', href: '/cultivation', icon: Leaf, color: 'text-green-400' },
  { id: 'analytics', label: 'Analytics', href: '/analytics', icon: BarChart3, color: 'text-purple-400' },
  { id: 'monitoring', label: 'Monitoring', href: '/monitoring', icon: Activity, color: 'text-orange-400' },
  { id: 'calculators', label: 'Calculators', href: '/calculators', icon: Calculator, color: 'text-cyan-400' },
];

export function QuickAccessSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>(defaultQuickLinks);
  const pathname = usePathname();

  // Load saved state
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsed !== null) {
      setIsCollapsed(savedCollapsed === 'true');
    }

    const savedLinks = localStorage.getItem('quick-links');
    if (savedLinks) {
      setQuickLinks(JSON.parse(savedLinks));
    }
  }, []);

  // Save collapsed state
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  const shouldExpand = isHovered && isCollapsed;

  return (
    <aside 
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gray-900 border-r border-gray-800 transition-all duration-300 z-30 ${
        isCollapsed && !shouldExpand ? 'w-16' : 'w-64'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="p-4 flex justify-end">
          <button
            onClick={toggleCollapsed}
            className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        </div>

        {/* Search - Only visible when expanded */}
        {(!isCollapsed || shouldExpand) && (
          <div className="px-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Quick search..."
                className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="flex-1 px-3 pb-4 overflow-y-auto">
          <div className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3 ${
            isCollapsed && !shouldExpand ? 'hidden' : ''
          }`}>
            Quick Access
          </div>
          
          <nav className="space-y-1">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                    isActive 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  title={isCollapsed && !shouldExpand ? link.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : link.color}`} />
                  {(!isCollapsed || shouldExpand) && (
                    <span className="font-medium">{link.label}</span>
                  )}
                </Link>
              );
            })}

            {/* Add New Link */}
            <button
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full"
              title={isCollapsed && !shouldExpand ? 'Add quick link' : undefined}
            >
              <Plus className="w-5 h-5 flex-shrink-0" />
              {(!isCollapsed || shouldExpand) && (
                <span className="font-medium">Add Link</span>
              )}
            </button>
          </nav>
        </div>

        {/* Recent Activity - Only visible when expanded */}
        {(!isCollapsed || shouldExpand) && (
          <div className="p-4 border-t border-gray-800">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Recent
            </div>
            <div className="space-y-2">
              <Link 
                href="/cultivation/recipes"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span className="truncate">Recipe Library</span>
              </Link>
              <Link 
                href="/analytics"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span className="truncate">Yield Analytics</span>
              </Link>
            </div>
          </div>
        )}

        {/* Settings Link */}
        <div className="p-3 border-t border-gray-800">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            title={isCollapsed && !shouldExpand ? 'Settings' : undefined}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {(!isCollapsed || shouldExpand) && (
              <span className="font-medium">Settings</span>
            )}
          </Link>
        </div>
      </div>
    </aside>
  );
}