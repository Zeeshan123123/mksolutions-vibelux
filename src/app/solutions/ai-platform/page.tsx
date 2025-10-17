'use client';

import Link from 'next/link';
import { 
  ArrowRight, Brain, Cpu, Bot, Activity, 
  Zap, Settings, BarChart3, Eye, Camera,
  CheckCircle, Sparkles, TrendingUp, 
  Building, Users, Code2, Globe, Shield,
  Gauge, AlertTriangle, Clock, Target
} from 'lucide-react';

export default function AIPlatformPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 rounded-full mb-4">
              <Brain className="w-4 h-4 mr-2" />
              <span className="text-white font-bold">VibeLux AI Platform</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
              Autonomous
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                {" "}Agriculture
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Advanced AI models, autonomous facility management, and predictive analytics. 
              Transform your operation from reactive monitoring to proactive optimization with our AutoPilot system.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/autopilot" className="bg-gradient-to-r from-green-600 to-emerald-700 hover:shadow-lg hover:shadow-green-500/25 text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                Explore AutoPilot
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/demo/ai-platform" className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                See AI in Action
                <Eye className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Capabilities */}
      <section className="py-20 px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Advanced AI Models at Work</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Six specialized machine learning models working together to optimize every aspect of your facility
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Hyperspectral Analysis */}
            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-2xl p-8 border border-green-800/50">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                <Camera className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Hyperspectral Plant Analysis</h3>
              <p className="text-gray-300 mb-6">
                Research-grade computer vision analyzes plant health in real-time using multiple vegetation indices. 
                Detect stress, nutrient deficiencies, and diseases before they become visible to the human eye.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>NDVI Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Disease Detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Stress Monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Growth Tracking</span>
                </div>
              </div>
            </div>

            {/* Predictive Analytics */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl p-8 border border-purple-800/50">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Predictive Analytics Engine</h3>
              <p className="text-gray-300 mb-6">
                Advanced ML models predict yield outcomes, equipment failures, and optimal harvest timing. 
                Make data-driven decisions with confidence intervals and risk assessments.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  <span>Yield Prediction</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  <span>Equipment Failure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  <span>Harvest Timing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  <span>Market Analysis</span>
                </div>
              </div>
            </div>
          </div>

          {/* AutoPilot System */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-12 border border-gray-700 relative overflow-hidden">
            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-full">
              AUTONOMOUS
            </div>
            
            <div className="relative z-10">
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bot className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">AutoPilot Autonomous Management</h3>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Level 5 automation for controlled environment agriculture. Your facility runs itself, 
                  learns from every cycle, and continuously optimizes for maximum efficiency.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Autonomous Control</h4>
                  <p className="text-sm text-gray-400">
                    AI adjusts lighting, climate, irrigation, and nutrients in real-time based on plant response
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Predictive Maintenance</h4>
                  <p className="text-sm text-gray-400">
                    Prevent equipment failures before they happen with AI-powered maintenance scheduling
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Continuous Learning</h4>
                  <p className="text-sm text-gray-400">
                    Every grow cycle improves the AI models, making your facility smarter over time
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Enterprise-Grade AI Infrastructure</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Built for scale with enterprise security, multi-site management, and custom model training
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Digital Twin */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
                <Building className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Digital Twin Technology</h3>
              <p className="text-gray-400 mb-6">
                Complete virtual facility modeling with scenario testing. Run what-if analyses 
                before making changes to your physical operation.
              </p>
              <Link href="/digital-twin" className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2">
                Explore Digital Twins <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Multi-Site Management */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Multi-Site Portfolio Management</h3>
              <p className="text-gray-400 mb-6">
                Centralized control and analytics across multiple facilities. Compare performance, 
                share insights, and optimize your entire portfolio.
              </p>
              <Link href="/multi-site" className="text-green-400 hover:text-green-300 font-medium flex items-center gap-2">
                Manage Portfolio <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Custom AI Models */}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Custom AI Model Training</h3>
              <p className="text-gray-400 mb-6">
                Train specialized models on your facility data. Crop-specific optimization, 
                proprietary genetics, and unique growing conditions.
              </p>
              <Link href="/ml/custom-training" className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-2">
                Custom Models <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Ecosystem */}
      <section className="py-20 px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-2xl p-12 border border-green-800/30">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Enhanced Partner Integrations</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                VibeLux AI Platform enhances your existing systems. We don't replace Priva, Grodan, 
                or Philips - we make them smarter with AI.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Climate Computer AI</h3>
                <p className="text-sm text-gray-400">AI-enhanced control strategies for Priva, Argus, Link4, and other climate systems</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Smart Lighting Control</h3>
                <p className="text-sm text-gray-400">AI-optimized spectrum recipes for Philips, Signify, and other LED systems</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Substrate Intelligence</h3>
                <p className="text-sm text-gray-400">AI-enhanced irrigation for Grodan, Perlite, and other growing media</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready for Autonomous Agriculture?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Transform your facility with enterprise-grade AI. Custom implementation and ongoing support included.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link 
              href="/contact?product=ai-platform" 
              className="bg-gradient-to-r from-green-600 to-emerald-700 hover:shadow-lg hover:shadow-green-500/25 text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              Schedule AI Demo
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/enterprise" 
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              Enterprise Pricing
              <Users className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="flex flex-wrap gap-6 justify-center items-center text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Enterprise security & compliance</span>
            </div>
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              <span>Full API access & custom integrations</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>24/7 support & monitoring</span>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              <span className="font-semibold">Powered by VibeLux</span> • Advanced AI models for autonomous agriculture
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}