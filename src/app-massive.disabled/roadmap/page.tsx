'use client';

import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import { 
  CheckCircle, Clock, AlertCircle,
  Calculator, Lightbulb, BarChart3, 
  Smartphone, Users, Building2,
  Layers, Leaf, Bell
} from 'lucide-react';

interface RoadmapItem {
  title: string;
  description: string;
  icon: any;
  status: 'completed' | 'in-progress' | 'planned' | 'exploring';
  features: string[];
  priority: 'high' | 'medium' | 'low';
}

const roadmapData: { [key: string]: RoadmapItem[] } = {
  'Current (Beta)': [
    {
      title: 'Core Lighting Design',
      description: 'Professional lighting calculators and 3D design tools',
      icon: Calculator,
      status: 'completed',
      priority: 'high',
      features: [
        'PPFD and DLI calculations',
        '3D lighting visualization', 
        'DLC fixture database integration',
        'Energy cost analysis',
        'Basic CAD import (DWG, DXF)',
        'PDF report generation'
      ]
    },
    {
      title: 'Beta Testing Program',
      description: 'Working with real growers to validate and improve features',
      icon: Users,
      status: 'in-progress',
      priority: 'high',
      features: [
        '8+ active beta facilities',
        'Regular feedback collection',
        'Feature prioritization based on user needs',
        'Bug fixes and improvements',
        'Performance optimization'
      ]
    }
  ],
  'Late 2024': [
    {
      title: 'Mobile Optimization',
      description: 'Better mobile experience for field use',
      icon: Smartphone,
      status: 'planned',
      priority: 'high',
      features: [
        'Mobile-responsive design improvements',
        'Touch-optimized interface',
        'Offline calculation capabilities',
        'Quick measurement tools',
        'Photo integration for notes'
      ]
    },
    {
      title: 'Enhanced CAD Support',
      description: 'Support for more file formats and better import experience',
      icon: Lightbulb,
      status: 'planned',
      priority: 'medium',
      features: [
        'Additional file format support',
        'Improved import reliability',
        'Better layer handling',
        'Enhanced export options',
        'Integration with popular CAD tools'
      ]
    }
  ],
  '2025 Goals': [
    {
      title: 'Cannabis-Specific Features',
      description: 'Specialized tools for cannabis cultivation',
      icon: Leaf,
      status: 'exploring',
      priority: 'high',
      features: [
        'Strain-specific recommendations',
        'Compliance tracking tools',
        'Growth stage optimization',
        'Yield prediction models',
        'Integration with seed-to-sale systems'
      ]
    },
    {
      title: 'Vertical Farming Tools',
      description: 'Multi-layer optimization for vertical operations',
      icon: Layers,
      status: 'exploring',
      priority: 'medium',
      features: [
        'Multi-layer design capabilities',
        'Heat interaction modeling',
        'Rapid growth cycle planning',
        'Space efficiency optimization',
        'Automated harvest scheduling'
      ]
    },
    {
      title: 'Greenhouse Integration',
      description: 'Tools for greenhouse supplemental lighting',
      icon: Building2,
      status: 'exploring',
      priority: 'medium',
      features: [
        'Natural light integration',
        'Seasonal optimization',
        'Climate system coordination',
        'Dutch growing method protocols',
        'Energy management automation'
      ]
    }
  ],
  'Future Ideas': [
    {
      title: 'Basic Sensor Integration',
      description: 'Connect with simple environmental sensors',
      icon: BarChart3,
      status: 'exploring',
      priority: 'low',
      features: [
        'Temperature and humidity monitoring',
        'Light level measurements',
        'Basic alerts and notifications',
        'Simple data logging',
        'Integration with popular sensor brands'
      ]
    }
  ]
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case 'in-progress':
      return <Clock className="w-5 h-5 text-blue-400" />;
    case 'planned':
      return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    case 'exploring':
      return <AlertCircle className="w-5 h-5 text-gray-400" />;
    default:
      return <Clock className="w-5 h-5 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-900/20 border-green-600/50 text-green-300';
    case 'in-progress':
      return 'bg-blue-900/20 border-blue-600/50 text-blue-300';
    case 'planned':
      return 'bg-yellow-900/20 border-yellow-600/50 text-yellow-300';
    case 'exploring':
      return 'bg-gray-900/20 border-gray-600/50 text-gray-300';
    default:
      return 'bg-gray-900/20 border-gray-600/50 text-gray-300';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'text-red-400';
    case 'medium':
      return 'text-yellow-400';
    case 'low':
      return 'text-green-400';
    default:
      return 'text-gray-400';
  }
};

export default function RoadmapPage() {
  return (
    <>
      <MarketingNavigation />
      <div className="min-h-screen bg-gray-950">
        {/* Header */}
        <div className="bg-gradient-to-b from-purple-900/20 to-gray-950 border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-600/50 rounded-full px-4 py-2 text-sm text-purple-300">
                <Bell className="w-4 h-4" />
                Updated Regularly Based on User Feedback
              </div>
              <h1 className="text-4xl font-bold text-white">Product Roadmap</h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Our honest development timeline based on real user needs and technical feasibility. 
                Priorities change based on beta user feedback.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-yellow-300 font-medium mb-2">Important Notes</h3>
                <ul className="text-yellow-200 text-sm space-y-1">
                  <li>• Timelines are estimates and may change based on user feedback</li>
                  <li>• Features marked "exploring" may not be developed if there's insufficient demand</li>
                  <li>• Beta users have direct input on feature prioritization</li>
                  <li>• We focus on building what growers actually need, not what sounds impressive</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap Timeline */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          {Object.entries(roadmapData).map(([period, items]) => (
            <div key={period} className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                {period}
                {period === 'Current (Beta)' && <CheckCircle className="w-6 h-6 text-green-400" />}
              </h2>
              
              <div className="grid gap-6">
                {items.map((item, index) => (
                  <div key={index} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-600 rounded-lg">
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                          <p className="text-gray-400">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full border text-sm ${getStatusColor(item.status)}`}>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(item.status)}
                            {item.status.replace('-', ' ')}
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${getPriorityColor(item.priority)}`}>
                          {item.priority} priority
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {item.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2 text-sm text-gray-300">
                          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Feedback CTA */}
        <div className="bg-gray-900 border-t border-gray-800">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold text-white">Help Shape Our Roadmap</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Your feedback directly influences what we build next. Join our beta program 
                or reach out with feature requests and priorities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Share Feedback
                </a>
                <a 
                  href="/sign-up"
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Join Beta Program
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}