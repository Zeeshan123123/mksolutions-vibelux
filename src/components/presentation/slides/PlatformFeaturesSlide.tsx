import { Monitor, Smartphone, Cloud, Shield, Zap, Users } from 'lucide-react';

export function PlatformFeaturesSlide() {
  return (
    <div className="h-full flex flex-col justify-center p-12 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            Platform Overview
          </h1>
          <p className="text-2xl text-indigo-200 max-w-4xl mx-auto">
            Everything you need in one comprehensive platform
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Features List */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Web-Based Dashboard</h3>
                <p className="text-indigo-200 text-sm">Access from any browser, no downloads required</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Mobile Optimized</h3>
                <p className="text-indigo-200 text-sm">Full functionality on tablets and smartphones</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Cloud Infrastructure</h3>
                <p className="text-indigo-200 text-sm">Enterprise-grade security and reliability</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Multi-User Collaboration</h3>
                <p className="text-indigo-200 text-sm">Teams can work together in real-time</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Real-Time Updates</h3>
                <p className="text-indigo-200 text-sm">Live data synchronization across all devices</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Enterprise Security</h3>
                <p className="text-indigo-200 text-sm">SOC 2 compliant with data encryption</p>
              </div>
            </div>
          </div>

          {/* Platform Stats */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Platform Performance</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">99.9%</div>
                <div className="text-gray-300 text-sm">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-pink-400 mb-2">&lt;100ms</div>
                <div className="text-gray-300 text-sm">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">24/7</div>
                <div className="text-gray-300 text-sm">Support</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">256-bit</div>
                <div className="text-gray-300 text-sm">Encryption</div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl">
              <h4 className="text-lg font-semibold text-white mb-3">Integrations</h4>
              <div className="flex flex-wrap gap-2">
                {['Salesforce', 'Slack', 'Zapier', 'API', 'Webhooks', 'CSV Export'].map((integration) => (
                  <span key={integration} className="px-3 py-1 bg-white/20 rounded-full text-sm text-gray-300">
                    {integration}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}