'use client';

import Link from 'next/link';
import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import { 
  Leaf, 
  Building2, 
  Layers,
  ArrowRight,
  CheckCircle,
  Bell
} from 'lucide-react';

export default function SolutionsPage() {
  const solutions = [
    {
      title: "Cannabis Cultivation",
      href: "/solutions/cannabis",
      icon: <Leaf className="w-8 h-8" />,
      description: "Optimize lighting for cannabis cultivation with strain-specific recommendations and compliance tools.",
      features: ["Strain-specific lighting", "Compliance tracking", "Yield optimization", "Energy efficiency"],
      status: "Beta Testing"
    },
    {
      title: "Vertical Farming", 
      href: "/solutions/vertical-farming",
      icon: <Layers className="w-8 h-8" />,
      description: "Maximize efficiency in vertical growing operations with multi-layer lighting design.",
      features: ["Multi-layer optimization", "Space efficiency", "Rapid growth cycles", "Automated schedules"],
      status: "In Development"
    },
    {
      title: "Greenhouse Production",
      href: "/solutions/greenhouse", 
      icon: <Building2 className="w-8 h-8" />,
      description: "Professional greenhouse lighting design with supplemental and sole-source configurations.",
      features: ["Supplemental lighting", "Dutch methods", "Climate integration", "Seasonal optimization"],
      status: "Planning"
    }
  ];

  return (
    <>
      <MarketingNavigation />
      <div className="min-h-screen bg-gray-950">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-purple-900/20 to-gray-950 border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-600/50 rounded-full px-4 py-2 text-sm text-purple-300">
                <Bell className="w-4 h-4" />
                Industry-Specific Solutions
              </div>
              <h1 className="text-5xl font-bold text-white">Solutions by Industry</h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                VibeLux adapts to your specific growing operation with tailored lighting optimization 
                for different cultivation methods and crops.
              </p>
            </div>
          </div>
        </div>

        {/* Solutions Grid */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid gap-8">
              {solutions.map((solution, index) => (
                <div key={solution.title} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row items-start gap-8">
                      {/* Icon & Title */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center text-white mb-4">
                          {solution.icon}
                        </div>
                        <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-600/50 rounded-full px-3 py-1 text-xs text-purple-300">
                          {solution.status}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-3">{solution.title}</h2>
                        <p className="text-gray-300 text-lg mb-6">{solution.description}</p>
                        
                        {/* Features */}
                        <div className="grid md:grid-cols-2 gap-3 mb-6">
                          {solution.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                              {feature}
                            </div>
                          ))}
                        </div>

                        {/* CTA */}
                        <Link 
                          href={solution.href}
                          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
                        >
                          Learn More
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Beta Notice */}
        <section className="py-20 bg-gray-900/50">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-purple-900/20 border border-purple-600/50 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Help Shape These Solutions</h2>
              <p className="text-purple-200 mb-6">
                We're working with real growers to develop these industry-specific features. 
                Join our beta program to influence development and get early access.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contact"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Join Beta Program
                </Link>
                <Link 
                  href="/about"
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Learn About VibeLux
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}