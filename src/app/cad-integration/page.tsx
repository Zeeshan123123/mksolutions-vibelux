'use client';

import Link from 'next/link';
import { 
  FileUp, Check, ArrowRight, Zap, Shield, Layers, 
  Package, Globe, Cpu, BarChart3, Users, Crown,
  ChevronRight, Sparkles, FileText, Building
} from 'lucide-react';

export default function CADIntegrationPage() {
  const supportedFormats = [
    { category: 'AutoCAD', formats: ['DWG', 'DXF', 'DWF', 'DGN'] },
    { category: 'Revit', formats: ['RVT', 'RFA', 'IFC', 'NWD'] },
    { category: 'SketchUp', formats: ['SKP', 'SKB'] },
    { category: '3D Models', formats: ['3DS', 'OBJ', 'FBX', 'DAE', 'STL'] },
    { category: 'CAD Standards', formats: ['STEP', 'IGES', 'SAT', 'BREP'] },
    { category: 'Other', formats: ['PDF', 'PLT', 'STP', 'IGS', 'Plus 40+ more'] }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast Conversion',
      description: 'Import and convert CAD files in seconds with Autodesk\'s powerful cloud processing'
    },
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with encrypted file handling and automatic cleanup'
    },
    {
      icon: Layers,
      title: 'Preserve All Layers',
      description: 'Maintain layer information, dimensions, and metadata from your original CAD files'
    },
    {
      icon: Cpu,
      title: 'AI-Powered Optimization',
      description: 'Automatically optimize imported layouts for maximum PPFD and energy efficiency'
    }
  ];

  const useCases = [
    {
      title: 'Retrofit Existing Facilities',
      description: 'Import your current facility layout and optimize lighting placement',
      image: '🏭'
    },
    {
      title: 'New Construction Planning',
      description: 'Work with architects using their native CAD files for perfect integration',
      image: '🏗️'
    },
    {
      title: 'Multi-Site Standardization',
      description: 'Import and replicate successful layouts across multiple locations',
      image: '🌐'
    }
  ];

  const plans = [
    {
      name: 'Free',
      imports: '0',
      formats: 'No CAD imports',
      price: '$0'
    },
    {
      name: 'Grower',
      imports: '5/month',
      formats: 'Simple formats (DWG, DXF, etc.)',
      price: '$29',
      popular: false
    },
    {
      name: 'Professional',
      imports: '20/month',
      formats: 'All 60+ formats',
      price: '$99',
      popular: true
    },
    {
      name: 'Business',
      imports: 'Unlimited',
      formats: 'All formats + priority processing',
      price: '$299'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-gray-950 to-blue-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 px-4 py-2 rounded-full border border-green-500/30">
              <Sparkles className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">NEW: Industry-First CAD Integration</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Import Any CAD File.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                Design Smarter.
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              The only lighting design platform that seamlessly imports 60+ CAD formats. 
              Work with your existing AutoCAD, Revit, SketchUp files and more.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                href="/design"
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center gap-2 group"
              >
                <FileUp className="w-5 h-5" />
                Try CAD Import Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#formats"
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all"
              >
                View All Formats
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">60+</div>
              <div className="text-gray-400">CAD Formats</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">10s</div>
              <div className="text-gray-400">Average Import Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-gray-400">Conversion Success</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">256-bit</div>
              <div className="text-gray-400">Encryption</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Enterprise-Grade CAD Integration
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Powered by Autodesk Platform Services, the same technology used by Fortune 500 companies
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Supported Formats */}
      <div id="formats" className="bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Every Format Your Team Uses
            </h2>
            <p className="text-gray-400">
              No more file conversion headaches. Import directly from your favorite CAD software.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {supportedFormats.map((category) => (
              <div key={category.category} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-400" />
                  {category.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {category.formats.map((format) => (
                    <span
                      key={format}
                      className="px-3 py-1 bg-gray-800 text-gray-300 rounded-lg text-sm font-mono"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Don't see your format? <Link href="/contact" className="text-green-400 hover:text-green-300">Contact us</Link> for custom support.
            </p>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Built for Real-World Workflows
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Whether you're retrofitting existing facilities or planning new construction, 
            our CAD integration streamlines your entire design process.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {useCases.map((useCase) => (
            <div key={useCase.title} className="text-center">
              <div className="text-6xl mb-4">{useCase.image}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{useCase.title}</h3>
              <p className="text-gray-400">{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              CAD Import Limits by Plan
            </h2>
            <p className="text-gray-400">
              Choose the plan that fits your workflow
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-gray-900 rounded-xl p-6 border ${
                  plan.popular ? 'border-green-500 shadow-lg shadow-green-500/20' : 'border-gray-800'
                } relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-white mb-1">{plan.price}</div>
                <div className="text-gray-400 text-sm mb-4">/month</div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{plan.imports}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{plan.formats}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link
              href="/pricing-simple"
              className="text-green-400 hover:text-green-300 font-medium inline-flex items-center gap-2"
            >
              View Full Pricing Details
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-gray-950 to-blue-900/20" />
        
        <div className="relative max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Import Your First CAD File?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Use VibeLux's CAD integration to design smarter
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all inline-flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all"
            >
              Schedule Demo
            </Link>
          </div>
          
          <p className="text-sm text-gray-500 mt-6">
            14-day free trial • Credit card required • 60+ CAD formats supported
          </p>
        </div>
      </div>
    </div>
  );
}