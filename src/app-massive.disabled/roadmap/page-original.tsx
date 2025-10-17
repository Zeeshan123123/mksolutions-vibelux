'use client';

import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import { 
  Target, Calendar, CheckCircle, Clock, 
  Rocket, Sparkles, Brain, Shield, Globe,
  Users, Zap, Database, ArrowRight
} from 'lucide-react';

interface RoadmapItem {
  title: string;
  description: string;
  icon: any;
  status: 'completed' | 'in-progress' | 'planned';
  quarter?: string;
  features: string[];
}

const roadmapData: { [key: string]: RoadmapItem[] } = {
  'Q1 2024': [
    {
      title: 'Advanced Automation',
      description: 'Complete greenhouse automation with AI-driven control systems',
      icon: Brain,
      status: 'completed',
      features: [
        'Blackout curtain photoperiod control',
        'Multi-layer screen coordination',
        'Weather-adaptive lighting',
        'Predictive climate control'
      ]
    },
    {
      title: 'Energy Trading Platform',
      description: 'Grid integration for revenue generation',
      icon: Zap,
      status: 'in-progress',
      features: [
        'Real-time energy pricing',
        'Demand response automation',
        'Virtual power plant participation',
        'Carbon credit tracking'
      ]
    }
  ],
  'Q2 2024': [
    {
      title: 'Mobile Excellence',
      description: 'Native mobile apps with full feature parity',
      icon: Globe,
      status: 'planned',
      features: [
        'iOS and Android native apps',
        'Offline mode with sync',
        'AR measurement tools',
        'Push notifications'
      ]
    },
    {
      title: 'Advanced Analytics 2.0',
      description: 'Machine learning powered insights',
      icon: Database,
      status: 'planned',
      features: [
        'Yield prediction models',
        'Disease detection AI',
        'Resource optimization',
        'Custom dashboards'
      ]
    }
  ],
  'Q3 2024': [
    {
      title: 'Global Expansion',
      description: 'Multi-language support and regional compliance',
      icon: Globe,
      status: 'planned',
      features: [
        '10+ language support',
        'Regional compliance tools',
        'Local fixture databases',
        'Currency localization'
      ]
    },
    {
      title: 'Enterprise Suite',
      description: 'Advanced features for large operations',
      icon: Shield,
      status: 'planned',
      features: [
        'SAML/SSO integration',
        'Advanced permissions',
        'Audit logging',
        'SLA guarantees'
      ]
    }
  ],
  'Q4 2024 & Beyond': [
    {
      title: 'Robotics Integration',
      description: 'Direct control of automated growing systems',
      icon: Rocket,
      status: 'planned',
      features: [
        'Harvest robot control',
        'Automated transplanting',
        'Vision system integration',
        'Task scheduling'
      ]
    },
    {
      title: 'Blockchain Traceability',
      description: 'Seed-to-sale tracking on blockchain',
      icon: Shield,
      status: 'planned',
      features: [
        'Immutable grow records',
        'Supply chain transparency',
        'Smart contracts',
        'Compliance automation'
      ]
    }
  ]
};

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'in-progress':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'planned':
      return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    default:
      return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4" />;
    case 'in-progress':
      return <Clock className="w-4 h-4" />;
    case 'planned':
      return <Calendar className="w-4 h-4" />;
    default:
      return <Calendar className="w-4 h-4" />;
  }
}

export default function RoadmapPage() {
  return (
    <>
      <MarketingNavigation />
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-purple-900/20 to-gray-950 py-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 rounded-full border border-purple-700/50 mb-6">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-200">Product Vision</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-6">Product Roadmap</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our vision for the future of controlled environment agriculture. 
              See what we're building to help you grow smarter, faster, and more sustainably.
            </p>
            
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1 rounded-full text-green-400 bg-green-400/10 border border-green-400/20">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Completed</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1 rounded-full text-blue-400 bg-blue-400/10 border border-blue-400/20">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">In Progress</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1 rounded-full text-gray-400 bg-gray-400/10 border border-gray-400/20">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Planned</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap Content */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          {Object.entries(roadmapData).map(([quarter, items]) => (
            <div key={quarter} className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-purple-400">{quarter}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={index}
                      className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-purple-700/50 transition-all"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-purple-600/10 rounded-lg">
                            <Icon className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                            <p className="text-gray-400">{item.description}</p>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          <span className="text-xs capitalize">{item.status.replace('-', ' ')}</span>
                        </div>
                      </div>
                      
                      {/* Features */}
                      <div className="space-y-2 ml-14">
                        {item.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0" />
                            <p className="text-sm text-gray-300">{feature}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {/* Request Feature Section */}
          <div className="mt-16 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-8 text-center">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Have a Feature Request?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              We're always listening to our community. Share your ideas and vote on features 
              that matter most to your operation.
            </p>
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors inline-flex items-center gap-2">
              Submit Feature Request
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}