'use client';

import Link from 'next/link';
import { 
  ArrowRight, FlaskConical, Microscope, BarChart3, 
  FileText, Calculator, Database, BookOpen,
  CheckCircle, Sparkles, TrendingUp, 
  Building, Users, Code2, Globe, Shield,
  Atom, Camera, LineChart, Target, Award
} from 'lucide-react';

export default function ResearchSuitePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 rounded-full mb-4">
              <FlaskConical className="w-4 h-4 mr-2" />
              <span className="text-white font-bold">VibeLux Research Suite</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
              Research-Grade
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
                {" "}Science
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Turn your facility into a research laboratory. Advanced statistical analysis, experimental design, 
              and scientific tools for publishable agricultural research. Built for universities and research institutions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/research" className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:shadow-lg hover:shadow-purple-500/25 text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                Explore Research Tools
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/demo/research-suite" className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                Academic Demo
                <Microscope className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Research Capabilities */}
      <section className="py-20 px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Complete Research Laboratory</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Professional-grade scientific tools typically found in $100K+ research systems, 
              integrated into one comprehensive platform
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Statistical Analysis */}
            <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-2xl p-8 border border-purple-800/50">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Advanced Statistical Analysis</h3>
              <p className="text-gray-300 mb-6">
                Complete statistical package with experimental design, ANOVA, regression analysis, 
                and publication-ready visualizations. Everything you need for peer-reviewed research.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  <span>ANOVA & T-Tests</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  <span>Regression Models</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  <span>DOE Planning</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  <span>Power Analysis</span>
                </div>
              </div>
            </div>

            {/* Experimental Design */}
            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl p-8 border border-blue-800/50">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Experimental Design Wizard</h3>
              <p className="text-gray-300 mb-6">
                AI-assisted experimental design with randomization, blocking, and statistical power calculations. 
                Optimize your research design before you start growing.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  <span>Randomized Blocks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  <span>Factorial Designs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  <span>Latin Squares</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                  <span>Split-Plot Design</span>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Scientific Tools */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Photosynthesis Modeling */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                <Atom className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Farquhar Photosynthesis Model</h3>
              <p className="text-gray-400 mb-6">
                Advanced photosynthesis modeling with temperature, CO₂, and light response curves. 
                Research-grade plant physiology analysis.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Vcmax calculations</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Jmax analysis</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>A-Ci curves</span>
                </li>
              </ul>
            </div>

            {/* Hyperspectral Analysis */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-6">
                <Camera className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Hyperspectral Imaging</h3>
              <p className="text-gray-400 mb-6">
                Research-grade hyperspectral analysis with multiple vegetation indices. 
                Non-destructive plant health assessment.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-orange-400" />
                  <span>NDVI, EVI, PRI indices</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-orange-400" />
                  <span>Chlorophyll mapping</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-orange-400" />
                  <span>Stress detection</span>
                </li>
              </ul>
            </div>

            {/* Data Logger Integration */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Research Data Logger</h3>
              <p className="text-gray-400 mb-6">
                High-frequency data collection with timestamps, metadata, and export to 
                standard research formats (CSV, NetCDF, HDF5).
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                  <span>1Hz+ sampling rates</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                  <span>Metadata standards</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                  <span>Research exports</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Publication Support */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl p-12 border border-purple-800/30">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-purple-400" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">Publication-Ready Research</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Complete research workflow from experimental design to manuscript preparation. 
                Everything you need for peer-reviewed publication.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">25+ Research Calculators</h3>
                <p className="text-sm text-gray-400">Professional tools for photosynthesis, VPD, DLI, and plant physiology calculations</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LineChart className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Publication Graphics</h3>
                <p className="text-sm text-gray-400">Generate publication-ready figures with error bars, significance markers, and journal formatting</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Research Library</h3>
                <p className="text-sm text-gray-400">Access to 10,000+ peer-reviewed papers with integrated citation management</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Method Validation</h3>
                <p className="text-sm text-gray-400">Documented protocols and validation data for regulatory submissions and grants</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Pricing */}
      <section className="py-20 px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Academic & Research Pricing</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Special pricing for universities, research institutions, and grant-funded projects
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Student/Postdoc */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Student & Postdoc</h3>
                <div className="text-4xl font-bold text-purple-400 mb-2">Free</div>
                <p className="text-gray-400">For individual research projects</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>All research tools</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Statistical analysis</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Publication support</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>1 research project</span>
                </li>
              </ul>
              <Link href="/signup?plan=student" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                Get Student Access
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Lab/Department */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-purple-600 relative">
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Lab & Department</h3>
                <div className="text-4xl font-bold text-purple-400 mb-2">$299<span className="text-xl text-gray-400">/mo</span></div>
                <p className="text-gray-400">For research groups and labs</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Unlimited projects</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Multi-user collaboration</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Custom experimental designs</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Link href="/contact?plan=lab" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                Contact for Lab Pricing
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Institution */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Institution</h3>
                <div className="text-4xl font-bold text-purple-400 mb-2">Custom</div>
                <p className="text-gray-400">University-wide licensing</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Campus-wide access</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Training & workshops</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Dedicated support</span>
                </li>
              </ul>
              <Link href="/contact?plan=institution" className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                Enterprise Contact
                <Users className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Academic CTA */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Advance Your Research</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join leading universities using VibeLux Research Suite for groundbreaking agricultural research.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              href="/research" 
              className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:shadow-lg hover:shadow-purple-500/25 text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              Start Research Project
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/contact?type=academic" 
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              Academic Partnership
              <Users className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="flex flex-wrap gap-6 justify-center items-center text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>FERPA & GDPR compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Grant proposal support</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Publication assistance</span>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              <span className="font-semibold">Powered by VibeLux</span> • Research-grade scientific tools for agriculture
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}