'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { 
  Menu, X, ChevronDown, ArrowRight,
  LayoutDashboard, Calculator, Zap, Info, HelpCircle
} from 'lucide-react';

const navigation = {
  main: [
    {
      name: 'Products',
      icon: LayoutDashboard,
      href: '/features',
      dropdown: [
        { name: 'Control Center', href: '/control-center', description: 'Unified facility management' },
        { name: 'Design Studio', href: '/design', description: '3D lighting design & planning' },
        { name: 'Calculators', href: '/calculators', description: '25+ professional tools' },
        { name: 'Energy Optimization', href: '/energy-optimization', description: 'Reduce costs & emissions' },
        { name: 'Marketplace', href: '/marketplace', description: 'Equipment & services' },
      ]
    },
    {
      name: 'Solutions',
      icon: Zap,
      href: '/solutions',
      dropdown: [
        { name: 'Indoor Farming', href: '/solutions/indoor', description: 'Vertical farms & greenhouses' },
        { name: 'Cannabis', href: '/solutions/cannabis', description: 'Compliant cultivation' },
        { name: 'Research', href: '/solutions/research', description: 'Academic & R&D facilities' },
        { name: 'Enterprise', href: '/solutions/enterprise', description: 'Multi-facility operations' },
      ]
    },
    { name: 'Pricing', href: '/pricing-simple' },
    { name: 'Resources', href: '/resources' },
  ],
  secondary: [
    { name: 'About', href: '/about' },
    { name: 'Support', href: '/support' },
    { name: 'Contact', href: '/contact' },
  ]
};

export function SimplifiedNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-900/95 backdrop-blur-xl shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-32">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/vibelux-logo.png"
                alt="VibeLux"
                width={560}
                height={168}
                className="h-32 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navigation.main.map((item) => (
              <div key={item.name} className="relative">
                {item.dropdown ? (
                  <div 
                    className="group"
                    onMouseEnter={() => setOpenDropdown(item.name)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button className="text-gray-300 hover:text-white transition-colors font-medium flex items-center gap-1">
                      {item.name}
                      <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                    </button>
                    
                    {/* Dropdown */}
                    <div className={`absolute top-full left-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl transition-all duration-200 ${
                      openDropdown === item.name ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}>
                      <div className="p-2">
                        {item.dropdown.map((subItem) => (
                          <Link 
                            key={subItem.name}
                            href={subItem.href} 
                            className="block px-4 py-3 rounded hover:bg-gray-700 transition-colors"
                          >
                            <div className="text-white font-medium">{subItem.name}</div>
                            <div className="text-gray-400 text-sm">{subItem.description}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link 
                    href={item.href} 
                    className="text-gray-300 hover:text-white transition-colors font-medium"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Help */}
            <Link 
              href="/support" 
              className="hidden lg:flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="text-sm">Help</span>
            </Link>

            {/* Auth Buttons */}
            <Link 
              href="/sign-in" 
              className="hidden lg:block text-gray-300 hover:text-white transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link 
              href="/sign-up" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Get Started
            </Link>

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-4 py-4 space-y-1">
            {navigation.main.map((item) => (
              <div key={item.name}>
                {item.dropdown ? (
                  <div>
                    <div className="text-gray-400 font-medium px-3 py-2">{item.name}</div>
                    {item.dropdown.map((subItem) => (
                      <Link 
                        key={subItem.name}
                        href={subItem.href} 
                        className="block pl-6 pr-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link 
                    href={item.href} 
                    className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            
            <div className="pt-4 mt-4 border-t border-gray-800">
              <Link 
                href="/sign-in" 
                className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}