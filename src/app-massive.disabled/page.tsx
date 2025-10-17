"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { 
  ArrowRight, 
  BarChart3,
  Brain,
  Building,
  Check,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Leaf,
  Menu,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Users,
  X,
  Zap,
  Shield,
  Smartphone,
  Wifi,
  Database,
  Calculator,
  Cpu,
  Activity,
  Settings,
  FileText,
  Layers,
  Code2,
  Heart,
  Bell,
  CheckSquare,
  Package,
  Globe,
  BookOpen,
  Gauge,
  Sun,
  FlaskConical,
  Thermometer,
  Droplets,
  HelpCircle,
  Atom,
  Camera,
  Link2,
  Cloud,
  Truck
} from 'lucide-react'
import ProcessFlow from '@/components/marketing/ProcessFlow'
import ROICalculator from '@/components/marketing/ROICalculator'
import TechnicalFlowChart from '@/components/marketing/TechnicalFlowChart'
import FeatureDeepDive from '@/components/marketing/FeatureDeepDive'
import IntegrationDiagram from '@/components/marketing/IntegrationDiagram'

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 w-full overflow-x-hidden relative">
      {/* Removed embedded navigation - using unified site header */}

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4">
            {/* New Badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-full mb-2">
              <Brain className="w-4 h-4 mr-2" />
              <span className="text-white font-bold">AI Platform for Agriculture • 5 Solutions • Live Now</span>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                  The AI Platform for
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-purple-600">
                    {" "}Agriculture
                  </span>
                </h1>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                  From lighting design to autonomous operations - VibeLux combines 5 specialized solutions 
                  into one comprehensive AI platform. Start simple, scale unlimited.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/design" className="bg-gradient-to-r from-blue-600 to-purple-700 hover:shadow-lg hover:shadow-blue-500/25 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                Start with Design Studio
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/solutions" className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                Explore All Solutions
                <Cpu className="w-5 h-5" />
              </Link>
              <Link href="/partners" className="bg-green-600/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl hover:bg-green-600/30 transition-all font-medium flex items-center justify-center gap-2">
                Partner Ecosystem
                <Link2 className="w-4 h-4" />
              </Link>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">Design Studio</div>
                <div className="text-gray-400">Lighting & Layout</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">AI Platform</div>
                <div className="text-gray-400">Autonomous Operations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">Research Suite</div>
                <div className="text-gray-400">Scientific Tools</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">Energy</div>
                <div className="text-gray-400">Optimization & Credits</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-400">Insights</div>
                <div className="text-gray-400">Analytics & BI</div>
              </div>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 justify-center items-center pt-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Enterprise Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                <span>Integrates with Priva, Grodan, Philips</span>
              </div>
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                <span>Developer API</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Self-Serve & Enterprise</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Features */}
      <section className="py-20 px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-white">Industry-Leading Platform Features</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The most comprehensive controlled environment agriculture software ever built
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Advanced Control Center */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                <Cpu className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Control Your Entire Operation</h3>
              <p className="text-gray-400 mb-6">
                Monitor and manage every aspect of your facility from one dashboard. Track performance, 
                catch issues early, and make adjustments in real-time to maintain optimal growing conditions.
              </p>
              <Link href="/control-center" className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-2">
                Explore Control Center <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Professional Calculators */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                <Calculator className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Calculate With Confidence</h3>
              <p className="text-gray-400 mb-6">
                Make precise decisions with 25+ professional calculators based on proven research. 
                From nutrient mixing to light planning, get the exact numbers you need to optimize your grow.
              </p>
              <Link href="/calculators" className="text-green-400 hover:text-green-300 font-medium flex items-center gap-2">
                View All Calculators <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* AI Design Studio */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 relative">
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                NEW: 60+ CAD FORMATS
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Design Smarter, Build Faster</h3>
              <p className="text-gray-400 mb-6">
                Import your existing CAD files and optimize lighting layouts instantly. Get accurate 
                PPFD calculations and energy estimates before you build or retrofit.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Sparkles className="w-4 h-4" />
                <span>Uses AI credits (10-50 per request)</span>
              </div>
              <Link href="/design" className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2">
                Launch Designer <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Sensor Integration Hub */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-6">
                <Wifi className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Use Your Existing Sensors</h3>
              <p className="text-gray-400 mb-6">
                Connect any sensor you already have and see all your data in one place. Get alerts 
                when conditions drift and track performance trends over time.
              </p>
              <Link href="/sensors" className="text-yellow-400 hover:text-yellow-300 font-medium flex items-center gap-2">
                Sensor Hub <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Research Library */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Make Research-Backed Decisions</h3>
              <p className="text-gray-400 mb-6">
                Access proven cultivation protocols and scientific research instantly. Get answers 
                to your questions based on real data, not guesswork.
              </p>
              <Link href="/research-library" className="text-orange-400 hover:text-orange-300 font-medium flex items-center gap-2">
                Access Research <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Compliance & Mobile */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Stay Compliant, Work Anywhere</h3>
              <p className="text-gray-400 mb-6">
                Track inventory with METRC/BioTrack integration and manage your operation from 
                anywhere with mobile access. Complete audit trails keep you inspection-ready.
              </p>
              <Link href="/compliance" className="text-teal-400 hover:text-teal-300 font-medium flex items-center gap-2">
                View Compliance <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Operations Management - NEW Section */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-b from-gray-950 to-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" />
              NEW: COMPLETE OPERATIONAL MANAGEMENT
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Beyond Monitoring - Run Your Business
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              We heard you. Monitoring is just the beginning. VibeLux now includes everything you need 
              for daily operations, from shift management to customer orders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Daily Operations */}
            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-2xl p-8 border border-green-500/20">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Daily Operations Hub</h3>
              <p className="text-gray-400 mb-6">
                Complete shift management, harvest tracking, and task workflows. Know what's happening 
                every minute of every day.
              </p>
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5" />
                  <span>Shift handoffs & communication</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5" />
                  <span>Harvest planning & tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5" />
                  <span>Task assignment & workflows</span>
                </li>
              </ul>
              <Link href="/operations/daily" className="text-green-400 hover:text-green-300 font-medium flex items-center gap-2">
                Explore Daily Ops <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Inventory Management */}
            <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-2xl p-8 border border-blue-500/20">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Smart Inventory Control</h3>
              <p className="text-gray-400 mb-6">
                Track everything from nutrients to packaging. Automated reordering, expiry alerts, 
                and consumption forecasting.
              </p>
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-400 mt-0.5" />
                  <span>Batch tracking & lot control</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-400 mt-0.5" />
                  <span>Automated reorder points</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-400 mt-0.5" />
                  <span>Consumption analytics</span>
                </li>
              </ul>
              <Link href="/operations/inventory" className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2">
                View Inventory <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Customer Orders */}
            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-purple-500/20">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Order Management</h3>
              <p className="text-gray-400 mb-6">
                Complete order-to-cash workflow. Manage customers, track orders, handle invoicing, 
                and monitor payment status.
              </p>
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 mt-0.5" />
                  <span>Customer relationship tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 mt-0.5" />
                  <span>Order fulfillment workflow</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-400 mt-0.5" />
                  <span>Automated invoicing</span>
                </li>
              </ul>
              <Link href="/operations/orders" className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-2">
                Manage Orders <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Compliance Workflows */}
            <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-2xl p-8 border border-orange-500/20">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Compliance Automation</h3>
              <p className="text-gray-400 mb-6">
                Step-by-step workflows for every compliance requirement. Automated evidence collection 
                and audit trail generation.
              </p>
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-orange-400 mt-0.5" />
                  <span>Automated workflow engine</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-orange-400 mt-0.5" />
                  <span>Evidence collection</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-orange-400 mt-0.5" />
                  <span>Inspection readiness</span>
                </li>
              </ul>
              <Link href="/operations/compliance" className="text-orange-400 hover:text-orange-300 font-medium flex items-center gap-2">
                View Compliance <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Vendor Management */}
            <div className="bg-gradient-to-br from-teal-900/20 to-cyan-900/20 rounded-2xl p-8 border border-teal-500/20">
              <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center mb-6">
                <Truck className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Vendor Management</h3>
              <p className="text-gray-400 mb-6">
                Track vendor performance, manage contracts, and optimize your supply chain. 
                Know which vendors deliver on time.
              </p>
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-teal-400 mt-0.5" />
                  <span>Performance scorecards</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-teal-400 mt-0.5" />
                  <span>Contract management</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-teal-400 mt-0.5" />
                  <span>Purchase order tracking</span>
                </li>
              </ul>
              <Link href="/operations/vendors" className="text-teal-400 hover:text-teal-300 font-medium flex items-center gap-2">
                Manage Vendors <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Knowledge Base */}
            <div className="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 rounded-2xl p-8 border border-yellow-500/20">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Knowledge & Training</h3>
              <p className="text-gray-400 mb-6">
                Centralized SOPs, training materials, and best practices. Track certifications 
                and ensure consistent operations.
              </p>
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <span>SOP version control</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <span>Training records</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <span>Interactive content</span>
                </li>
              </ul>
              <Link href="/operations/knowledge" className="text-yellow-400 hover:text-yellow-300 font-medium flex items-center gap-2">
                Access Knowledge <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="text-center">
            <Link href="/operations">
              <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-500/25 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-3 mx-auto">
                <Gauge className="w-6 h-6" />
                Explore Operations Center
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <p className="text-sm text-gray-400 mt-4">
              Everything you need to run a professional growing operation
            </p>
          </div>
        </div>
      </section>

      {/* Advanced Features Showcase */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-sm font-bold mb-4">
              <Sparkles className="w-4 h-4" />
              50+ ADVANCED SYSTEMS
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              The Most Advanced Cultivation Platform Ever Built
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Research-grade tools, AI assistance, comprehensive analytics, and advanced automation. 
              All integrated into one powerful platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Research & Science */}
            <div className="bg-gradient-to-br from-violet-900/20 to-purple-900/20 rounded-xl p-6 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <FlaskConical className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Research Suite</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• ANOVA and regression analysis</li>
                <li>• Experiment design tools</li>
                <li>• Statistical data analysis</li>
                <li>• Research paper integration</li>
              </ul>
            </div>

            {/* AI & Machine Learning */}
            <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-xl p-6 border border-blue-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white">AI Everything</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Advanced AI integration</li>
                <li>• AI-assisted recommendations</li>
                <li>• Machine learning insights</li>
                <li>• Automated data analysis</li>
              </ul>
            </div>

            {/* Hyperspectral & Vision */}
            <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 rounded-xl p-6 border border-emerald-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Camera className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Computer Vision</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Hyperspectral imaging (400-1000nm)</li>
                <li>• Trichome density analysis</li>
                <li>• 3D biomass visualization</li>
                <li>• Early disease detection</li>
              </ul>
            </div>

            {/* Sustainability Tracking */}
            <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-xl p-6 border border-yellow-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Sustainability Tracking</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Carbon footprint monitoring</li>
                <li>• Supply chain documentation</li>
                <li>• Automated reporting</li>
                <li>• ESG compliance tracking</li>
              </ul>
            </div>

            {/* Advanced Analytics */}
            <div className="bg-gradient-to-br from-red-900/20 to-pink-900/20 rounded-xl p-6 border border-red-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Advanced Analytics</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Real-time anomaly detection</li>
                <li>• Multi-algorithm forecasting</li>
                <li>• Interactive dashboards</li>
                <li>• Predictive optimization</li>
              </ul>
              <div className="mt-4">
                <Link href="/advanced-analytics" className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center gap-2">
                  View Live Analytics <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Weather & Energy */}
            <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-xl p-6 border border-cyan-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Cloud className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Weather Intelligence</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• NOAA weather integration</li>
                <li>• Weather-aware energy optimization</li>
                <li>• Natural ventilation timing</li>
                <li>• VPD-based HVAC control</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <Link href="/unified-dashboard">
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/25 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-3 mx-auto">
                🚀 Access Unified Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <p className="text-sm text-gray-400 mt-4">
              All 50+ advanced features integrated and ready to use
            </p>
          </div>
        </div>
      </section>

      {/* CAD Integration Highlight */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-sm font-bold">
                <Sparkles className="w-4 h-4" />
                INDUSTRY FIRST
              </div>
              <h2 className="text-4xl font-bold text-white">
                Import Your Existing Facility Designs
              </h2>
              <p className="text-xl text-gray-300">
                The only cultivation platform with professional CAD integration. Import your architectural 
                drawings, MEP models, and existing designs directly into our AI-powered lighting optimizer.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">60+ Professional Formats</h4>
                    <p className="text-gray-400">AutoCAD DWG/DXF, Revit RVT/RFA, IFC BIM, SketchUp, STEP, and 56 more</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Multi-Model Coordination</h4>
                    <p className="text-gray-400">Load architectural, electrical, and HVAC models together</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Automatic Room Detection</h4>
                    <p className="text-gray-400">Extract dimensions, electrical systems, and materials from BIM</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Link href="/design/advanced" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/25 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
                  Try CAD Import
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/features#cad" className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all">
                  Learn More
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl p-8 border border-purple-500/20">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-800/80 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">DWG</div>
                    <div className="text-xs text-gray-400">AutoCAD</div>
                  </div>
                  <div className="bg-gray-800/80 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">RVT</div>
                    <div className="text-xs text-gray-400">Revit</div>
                  </div>
                  <div className="bg-gray-800/80 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">IFC</div>
                    <div className="text-xs text-gray-400">BIM</div>
                  </div>
                  <div className="bg-gray-800/80 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">SKP</div>
                    <div className="text-xs text-gray-400">SketchUp</div>
                  </div>
                  <div className="bg-gray-800/80 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400">STEP</div>
                    <div className="text-xs text-gray-400">3D CAD</div>
                  </div>
                  <div className="bg-gray-800/80 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-teal-400">+56</div>
                    <div className="text-xs text-gray-400">More</div>
                  </div>
                </div>
                
                <div className="mt-6 text-center text-gray-400">
                  <p className="text-sm">Powered by Autodesk Platform Services</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Crop Support */}
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-b from-gray-900/50 to-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-white">Complete Multi-Crop Support</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Purpose-built for cannabis, tomatoes, leafy greens, herbs, and all CEA crops
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Leaf className="w-6 h-6 text-green-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Cannabis</h4>
              <p className="text-sm text-gray-400">Complete seed-to-sale with METRC/BioTrack</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Leaf className="w-6 h-6 text-red-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Tomatoes</h4>
              <p className="text-sm text-gray-400">Advanced Dutch growing methods</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 text-center">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Leaf className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Leafy Greens</h4>
              <p className="text-sm text-gray-400">Vertical farming optimization</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 text-center">
              <div className="w-12 h-12 bg-lime-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Leaf className="w-6 h-6 text-lime-400" />
              </div>
              <h4 className="font-semibold text-white mb-2">Herbs & More</h4>
              <p className="text-sm text-gray-400">Any controlled environment crop</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dutch Research Tools Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full mb-4">
              <Globe className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">Advanced Dutch Research</span>
            </div>
            <h2 className="text-4xl font-bold text-white">Professional Tomato Cultivation Tools</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Based on proven Dutch greenhouse research and commercial best practices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <Activity className="w-8 h-8 text-orange-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Plant Physiological Monitor</h4>
              <p className="text-sm text-gray-400">Head width monitoring, VeGe balance analysis, and exhaustion detection</p>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <Shield className="w-8 h-8 text-orange-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">IPM Dashboard</h4>
              <p className="text-sm text-gray-400">Zero tolerance protocols with specific thresholds for whitefly and thrips</p>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <Droplets className="w-8 h-8 text-orange-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Advanced VPD Calculator</h4>
              <p className="text-sm text-gray-400">5 g/m³ HD target with pollination success probability analysis</p>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <Thermometer className="w-8 h-8 text-orange-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">P-Band Climate Control</h4>
              <p className="text-sm text-gray-400">Light-based temperature targets with momentum prevention</p>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <FlaskConical className="w-8 h-8 text-orange-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Nutrient Calculator</h4>
              <p className="text-sm text-gray-400">Complete drip and drain analysis with Dutch research targets</p>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <Sun className="w-8 h-8 text-orange-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Light-Based Irrigation</h4>
              <p className="text-sm text-gray-400">DLI-driven irrigation with drain percentage optimization</p>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Features Grid */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-white">Enterprise-Grade Capabilities</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built by industry experts with decades of cultivation experience
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Feature Cards */}
            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <Heart className="w-8 h-8 text-red-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Health Scoring</h4>
              <p className="text-sm text-gray-400">Real-time facility KPIs and composite health metrics</p>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <Zap className="w-8 h-8 text-yellow-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Energy ROI</h4>
              <p className="text-sm text-gray-400">Cost per gram tracking and peak hour optimization</p>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <Sun className="w-8 h-8 text-orange-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Lighting ROI</h4>
              <p className="text-sm text-gray-400">PPFD-per-kWh and fixture degradation monitoring</p>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <Bell className="w-8 h-8 text-blue-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Alert Center</h4>
              <p className="text-sm text-gray-400">Real-time alerts with acknowledgment workflow</p>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <CheckSquare className="w-8 h-8 text-green-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Task Management</h4>
              <p className="text-sm text-gray-400">Kanban boards with recurring task support</p>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <Database className="w-8 h-8 text-purple-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Backup & Recovery</h4>
              <p className="text-sm text-gray-400">Automated backups and disaster recovery planning</p>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <Layers className="w-8 h-8 text-indigo-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Multi-Zone Climate</h4>
              <p className="text-sm text-gray-400">Recipe library and zone-based automation</p>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <Smartphone className="w-8 h-8 text-teal-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Mobile Field Ops</h4>
              <p className="text-sm text-gray-400">Touch-optimized interface with offline support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Benefits */}
      <section className="py-20 px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Built for Professional Growers
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">One System, Better Results</h4>
                    <p className="text-gray-400">Replace multiple tools with one platform that actually works together</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">Use Your Equipment</h4>
                    <p className="text-gray-400">Works with any hardware, sensors, or lights you already have</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">See Real Savings</h4>
                    <p className="text-gray-400">Track energy costs and identify savings opportunities immediately</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">Secure and Reliable</h4>
                    <p className="text-gray-400">Your data stays private with bank-level encryption</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-white">Get Answers Fast</h4>
                    <p className="text-gray-400">Direct access to cultivation experts when you need them</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/sign-up" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-gray-800 p-6 rounded-xl">
                  <div className="text-3xl font-bold text-purple-400 mb-2">25+</div>
                  <p className="text-gray-400">Professional Calculators</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl">
                  <div className="text-3xl font-bold text-green-400 mb-2">Beta</div>
                  <p className="text-gray-400">Platform Uptime</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-gray-800 p-6 rounded-xl">
                  <div className="text-3xl font-bold text-blue-400 mb-2">8+</div>
                  <p className="text-gray-400">Beta Facilities</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">Beta</div>
                  <p className="text-gray-400">Expert Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Flow Chart */}
      <TechnicalFlowChart />
      
      {/* Feature Deep Dive */}
      <FeatureDeepDive />
      
      {/* Integration Diagram */}
      <IntegrationDiagram />
      
      {/* Process Flow */}
      <ProcessFlow />
      
      {/* ROI Calculator */}
      <ROICalculator />

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white">
              Ready to Transform Your Growing Operation?
            </h2>
            <p className="text-xl text-gray-400">
              Join leading growers using VibeLux to optimize energy, increase yields, 
              and implement advanced cultivation techniques.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
                Start Free Trial
              </Link>
              <Link href="/presentation/nsave" className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors">
                View Partnership Deck
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Image
                src="/vibelux-logo.png"
                alt="VibeLux"
                width={480}
                height={144}
                className="h-32 w-auto"
              />
              <p className="text-gray-400 text-sm">
                The future of controlled environment agriculture.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-white">Platform</h4>
              <div className="space-y-2">
                <Link href="/control-center" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Control Center
                </Link>
                <Link href="/dashboard" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Dashboard
                </Link>
                <Link href="/energy" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Energy Management
                </Link>
                <Link href="/calculators" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Pro Calculators
                </Link>
                <Link href="/design" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  AI Design Studio
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-white">Solutions</h4>
              <div className="space-y-2">
                <Link href="/research" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Research Suite
                </Link>
                <Link href="/marketplace" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Marketplace
                </Link>
                <Link href="/energy-optimization" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Energy Optimization
                </Link>
                <Link href="/presentation/nsave" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Growing as a Service
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-white">Company</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  About
                </Link>
                <Link href="/how-it-works" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  How It Works
                </Link>
                <Link href="/getting-started" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Getting Started
                </Link>
                <Link href="/glossary" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Glossary
                </Link>
                <Link href="/faq" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  FAQ
                </Link>
                <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 VibeLux. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}