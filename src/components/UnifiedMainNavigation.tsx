'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, X, User } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { ShoppingCartDrawer } from '@/components/cart/ShoppingCart';

interface NavItem {
  label: string;
  href?: string;
  items?: {
    label: string;
    href: string;
    description?: string;
  }[];
}

const navigation: NavItem[] = [
  {
    label: 'Product',
    items: [
      { 
        label: 'Design Tools', 
        href: '/tools',
        description: '3D Designer, Calculators, and Planning Tools'
      },
      { 
        label: 'Automation', 
        href: '/automation',
        description: 'Greenhouse Controls & Energy Management'
      },
      { 
        label: 'Features Overview', 
        href: '/features',
        description: 'See Everything VibeLux Can Do'
      },
      { 
        label: "What's New", 
        href: '/changelog',
        description: 'Latest Updates and Improvements'
      },
      { 
        label: 'Roadmap', 
        href: '/roadmap',
        description: 'See What We\'re Building Next'
      }
    ]
  },
  {
    label: 'Marketplace',
    items: [
      {
        label: 'Browse Licenses',
        href: '/marketplace/trial-licenses',
        description: 'License proven growth recipes'
      },
      {
        label: 'My Licenses',
        href: '/marketplace/my-licenses',
        description: 'Your purchased licenses'
      },
      {
        label: 'Seller Portal',
        href: '/marketplace/seller',
        description: 'Manage listings and purchases'
      }
    ]
  },
  {
    label: 'Solutions',
    items: [
      { 
        label: 'Cannabis Cultivation', 
        href: '/solutions/cannabis',
        description: 'Optimize Your Cannabis Operation'
      },
      { 
        label: 'Vertical Farming', 
        href: '/solutions/vertical-farming',
        description: 'Maximize Vertical Growing Efficiency'
      },
      { 
        label: 'Greenhouse Production', 
        href: '/solutions/greenhouse',
        description: 'Professional Greenhouse Management'
      },
      { 
        label: 'Energy Optimization', 
        href: '/energy-optimization',
        description: 'Reduce Costs by 20-40%'
      }
    ]
  },
  {
    label: 'Pricing',
    href: '/pricing'
  },
  {
    label: 'Resources',
    items: [
      { 
        label: 'Documentation', 
        href: '/docs',
        description: 'Guides and Tutorials'
      },
      { 
        label: 'API Reference', 
        href: '/api-docs',
        description: 'Developer Documentation'
      },
      { 
        label: 'Blog', 
        href: '/blog',
        description: 'Industry Insights and Tips'
      },
      {
        label: 'Export Center',
        href: '/export-center',
        description: 'Generate and download branded exports'
      },
      {
        label: 'Projects',
        href: '/projects',
        description: 'Create and manage your projects'
      },
      { 
        label: 'How SOP Audits Work', 
        href: '/how-it-works/sop-audits',
        description: 'SOPs, check-ins, verification, and audit trails'
      },
      {
        label: 'Compliance Dashboard',
        href: '/compliance/dashboard',
        description: 'Certificates, pesticides, HACCP, chain of custody'
      },
      { 
        label: 'Finance Dashboard',
        href: '/finance',
        description: 'Invoices, payments, budgets, cashflow'
      },
      { 
        label: 'Support', 
        href: '/support',
        description: 'Get Help When You Need It'
      }
    ]
  },
  {
    label: 'Company',
    items: [
      { 
        label: 'About', 
        href: '/about',
        description: 'Our Mission and Team'
      },
      { 
        label: 'Careers', 
        href: '/careers',
        description: 'Join Our Growing Team'
      },
      { 
        label: 'Contact', 
        href: '/contact',
        description: 'Get in Touch'
      }
    ]
  }
];

export function UnifiedMainNavigation() {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center py-2">
              <Image
                src="/vibelux-logo.png"
                alt="VibeLux"
                width={640}
                height={192}
                className="h-20 w-auto object-contain"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 ml-8" ref={dropdownRef}>
            {navigation.map((item) => (
              <div key={item.label} className="relative">
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'text-white bg-gray-800'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                      aria-expanded={openDropdown === item.label}
                      aria-haspopup="true"
                      aria-label={`${item.label} menu`}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-1 ${
                        openDropdown === item.label
                          ? 'text-white bg-gray-800'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      {item.label}
                      <ChevronDown className={`w-4 h-4 transition-transform ${
                        openDropdown === item.label ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {/* Dropdown */}
                    {openDropdown === item.label && item.items && (
                      <div 
                        role="menu" 
                        aria-label={`${item.label} submenu`}
                        className="absolute left-0 mt-2 w-64 bg-gray-900 rounded-lg shadow-lg border border-gray-800 py-2"
                      >
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            role="menuitem"
                            onClick={() => setOpenDropdown(null)}
                            className="block px-4 py-3 hover:bg-gray-800 transition-colors"
                          >
                            <div className="text-sm font-medium text-white">
                              {subItem.label}
                            </div>
                            {subItem.description && (
                              <div className="text-xs text-gray-400 mt-1">
                                {subItem.description}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            {/* Shopping Cart */}
            <ShoppingCartDrawer />
            
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/account"
                  className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || 'U'}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle mobile menu"
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <div key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive(item.href)
                        ? 'text-white bg-gray-800'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <div className="px-3 py-2 text-base font-medium text-gray-300">
                      {item.label}
                    </div>
                    {item.items?.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block pl-6 pr-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800"
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </>
                )}
              </div>
            ))}
            
            {/* Mobile Auth */}
            <div className="pt-4 border-t border-gray-800">
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-white bg-purple-600 hover:bg-purple-700 mt-2"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}