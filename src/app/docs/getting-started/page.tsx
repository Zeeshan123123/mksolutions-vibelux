import { Metadata } from 'next';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle, 
  Lightbulb, 
  Rocket,
  Settings,
  BarChart3,
  Users,
  BookOpen,
  MessageCircle,
  ChevronRight
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Getting Started - VibeLux Documentation',
  description: 'Learn how to get started with VibeLux platform. Step-by-step guide for new users.',
};

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
              <Rocket className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Quick Start Guide</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Getting Started with VibeLux</h1>
            <p className="text-xl text-gray-400">
              Everything you need to know to start optimizing your growing operation
            </p>
          </div>

          {/* Progress Steps */}
          <div className="bg-gray-800/50 rounded-xl p-6 mb-12 border border-gray-700">
            <h3 className="font-semibold text-white mb-4">Your Journey</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { step: 1, label: 'Create Account', icon: Users },
                { step: 2, label: 'Setup Facility', icon: Settings },
                { step: 3, label: 'Connect Sensors', icon: Lightbulb },
                { step: 4, label: 'Design Layout', icon: BarChart3 },
                { step: 5, label: 'Start Optimizing', icon: Rocket }
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold">{item.step}</span>
                  </div>
                  <div className="flex-1">
                    <item.icon className="w-5 h-5 text-gray-400 mb-1" />
                    <p className="text-sm text-gray-300">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-12">
            {/* Step 1 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">1</span>
                </div>
                Create Your Account
              </h2>
              
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <p className="text-gray-300 mb-4">
                  Start your VibeLux journey with a 14-day free trial. Credit card required.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Sign up at vibelux.ai/sign-up</p>
                      <p className="text-sm text-gray-400">Use your business email for team features</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Complete your profile</p>
                      <p className="text-sm text-gray-400">Tell us about your role and growing experience</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Choose your plan</p>
                      <p className="text-sm text-gray-400">Start with free trial, upgrade anytime</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link href="/sign-up" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </section>

            {/* Step 2 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">2</span>
                </div>
                Set Up Your Facility
              </h2>
              
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <p className="text-gray-300 mb-4">
                  Add your first facility to start monitoring and optimizing.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-white mb-2">Basic Information</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>• Facility name and location</li>
                      <li>• Facility type (greenhouse, indoor, vertical)</li>
                      <li>• Total growing area</li>
                      <li>• Number of grow rooms/zones</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-2">Crop Details</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>• Primary crop types</li>
                      <li>• Growing methods</li>
                      <li>• Current growth stage</li>
                      <li>• Production goals</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                  <p className="text-sm text-blue-400">
                    💡 Pro Tip: Be as accurate as possible with your facility details. This helps our AI provide better recommendations.
                  </p>
                </div>
              </div>
            </section>

            {/* Step 3 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">3</span>
                </div>
                Connect Your Sensors (Optional)
              </h2>
              
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <p className="text-gray-300 mb-4">
                  VibeLux works with 100+ sensor brands. Connect your existing sensors or start with manual data entry.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-white mb-2">Popular Integrations</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Aranet', 'HOBO', 'Trolmaster', 'Argus'].map((brand) => (
                        <div key={brand} className="bg-gray-900 px-3 py-2 rounded text-sm text-gray-300 text-center">
                          {brand}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-white mb-2">Connection Methods</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>• Direct WiFi/Ethernet connection</li>
                      <li>• API integration</li>
                      <li>• CSV data import</li>
                      <li>• Manual data entry</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 4 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">4</span>
                </div>
                Design Your Layout
              </h2>
              
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <p className="text-gray-300 mb-4">
                  Use our advanced design tools to model your facility and optimize lighting.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <h4 className="font-medium text-white mb-2">Option 1: Import CAD</h4>
                    <p className="text-sm text-gray-400 mb-3">
                      Import existing CAD files (DWG, RVT, IFC, etc.) for instant setup
                    </p>
                   <Link href="/design/advanced" className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
                      Learn more <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <h4 className="font-medium text-white mb-2">Option 2: Draw Layout</h4>
                    <p className="text-sm text-gray-400 mb-3">
                      Use our intuitive design tools to create your facility layout
                    </p>
                    <Link href="/design" className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
                      Start designing <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 5 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">5</span>
                </div>
                Start Optimizing
              </h2>
              
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <p className="text-gray-300 mb-4">
                  Access your dashboard to monitor performance and receive optimization recommendations.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <BarChart3 className="w-8 h-8 text-purple-400 mb-2" />
                    <h4 className="font-medium text-white mb-1">Monitor</h4>
                    <p className="text-sm text-gray-400">
                      Real-time environmental data and alerts
                    </p>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <Lightbulb className="w-8 h-8 text-yellow-400 mb-2" />
                    <h4 className="font-medium text-white mb-1">Optimize</h4>
                    <p className="text-sm text-gray-400">
                      AI-powered recommendations for efficiency
                    </p>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <Rocket className="w-8 h-8 text-green-400 mb-2" />
                    <h4 className="font-medium text-white mb-1">Grow</h4>
                    <p className="text-sm text-gray-400">
                      Track improvements and scale success
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Next Steps */}
          <div className="mt-16 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-8 border border-purple-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">What's Next?</h3>
            <p className="text-gray-300 mb-6">
              Now that you're set up, explore these resources to get the most from VibeLux:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/docs" className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
                <BookOpen className="w-8 h-8 text-purple-400" />
                <div>
                  <h4 className="font-medium text-white">Documentation</h4>
                  <p className="text-sm text-gray-400">Detailed guides and tutorials</p>
                </div>
              </Link>
              
              <Link href="/calculators" className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
                <BarChart3 className="w-8 h-8 text-green-400" />
                <div>
                  <h4 className="font-medium text-white">Calculators</h4>
                  <p className="text-sm text-gray-400">Professional growing tools</p>
                </div>
              </Link>
              
              <Link href="/support" className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
                <MessageCircle className="w-8 h-8 text-blue-400" />
                <div>
                  <h4 className="font-medium text-white">Support</h4>
                  <p className="text-sm text-gray-400">Get help from our team</p>
                </div>
              </Link>
              
              <Link href="/control-center" className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 p-4 rounded-lg transition-colors">
                <Settings className="w-8 h-8 text-yellow-400" />
                <div>
                  <h4 className="font-medium text-white">Control Center</h4>
                  <p className="text-sm text-gray-400">Manage your operations</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}