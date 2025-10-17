'use client';

import Link from 'next/link';
import { 
  ArrowRight, Brain, Zap, Settings, BarChart3, 
  Layers, Cpu, FileText, Download, Play,
  CheckCircle, Sparkles, Calculator, 
  Building, Users, Code2, Globe, Shield
} from 'lucide-react';

export default function DesignStudioPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-full mb-4">
              <Layers className="w-4 h-4 mr-2" />
              <span className="text-white font-bold">VibeLux Design Studio</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
              Professional Lighting
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                {" "}Design
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              The industry-leading lighting design tool that started it all. Create precise PPFD maps, 
              import CAD files, and optimize layouts with professional-grade accuracy. Now enhanced with AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/design" className="bg-gradient-to-r from-blue-600 to-purple-700 hover:shadow-lg hover:shadow-blue-500/25 text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                Start Designing Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/demo/design-studio" className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                Watch Demo
                <Play className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Industry-Leading Design Capabilities</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Trusted by professionals worldwide for precision lighting design and facility optimization
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* CAD Integration */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">60+ CAD Format Support</h3>
              <p className="text-gray-400 mb-6">
                Import your existing architectural drawings instantly. Support for AutoCAD, SketchUp, 
                Revit, and dozens more formats with intelligent layer recognition.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>DWG, DXF, SKP, RVT formats</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Automatic scale detection</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Layer-based organization</span>
                </li>
              </ul>
            </div>

            {/* PPFD Mapping */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Precision PPFD Analysis</h3>
              <p className="text-gray-400 mb-6">
                Generate accurate photosynthetic photon flux density maps with real fixture photometric data. 
                Professional-grade accuracy that matches field measurements.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>IES file integration</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>3D raytracing calculations</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Uniformity analysis</span>
                </li>
              </ul>
            </div>

            {/* AI Enhancement */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 relative">
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                AI ENHANCED
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI-Powered Optimization</h3>
              <p className="text-gray-400 mb-6">
                Let AI suggest optimal fixture placement, identify efficiency improvements, 
                and automatically balance uniformity with energy costs.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Auto-placement suggestions</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Energy optimization</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Cost-performance balance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Integration with Platform */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-2xl p-12 border border-blue-800/30">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Part of the Complete VibeLux Platform</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Design Studio seamlessly integrates with all VibeLux solutions. Start with lighting, 
                scale to full facility automation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cpu className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">AI Platform</h3>
                <p className="text-sm text-gray-400">Upgrade to autonomous facility management</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Research Suite</h3>
                <p className="text-sm text-gray-400">Add scientific analysis tools</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Energy</h3>
                <p className="text-sm text-gray-400">Optimize energy costs and carbon credits</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Insights</h3>
                <p className="text-sm text-gray-400">Advanced analytics and reporting</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & CTA */}
      <section className="py-20 px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Start Designing Today</h2>
          <p className="text-xl text-gray-400 mb-8">
            Free to start, upgrade as you grow. Professional tools with self-serve simplicity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              href="/design" 
              className="bg-gradient-to-r from-blue-600 to-purple-700 hover:shadow-lg hover:shadow-blue-500/25 text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              Try Design Studio Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/contact?product=design-studio" 
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              Enterprise Demo
              <Users className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="flex flex-wrap gap-6 justify-center items-center text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Works in any browser</span>
            </div>
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              <span>API access available</span>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              <span className="font-semibold">Powered by VibeLux</span> • Part of the complete AI platform for agriculture
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}