'use client';

import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { 
  Cpu, Zap, Shield, Activity, Database, 
  GitBranch, Cloud, ArrowRight
} from 'lucide-react';

const automationFeatures = [
  {
    title: 'Greenhouse Controls',
    description: 'Complete automation for climate, irrigation, and screens',
    href: '/greenhouse',
    icon: Cpu,
    features: ['Climate control', 'Irrigation scheduling', 'Screen management', 'Alert systems']
  },
  {
    title: 'Energy Management',
    description: 'Optimize energy usage and reduce costs by 20-40%',
    href: '/energy',
    icon: Zap,
    features: ['Load balancing', 'Peak shaving', 'Demand response', 'Grid integration']
  },
  {
    title: 'Equipment Platform',
    description: 'Smart equipment management and predictive maintenance',
    href: '/equipment-board',
    icon: Shield,
    features: ['Performance tracking', 'Maintenance alerts', 'Investment platform', 'ROI tracking']
  },
  {
    title: 'IoT Integration',
    description: 'Connect sensors, controllers, and monitoring systems',
    href: '/sensors',
    icon: Activity,
    features: ['Real-time monitoring', 'Sensor networks', 'API integration', 'Custom alerts']
  }
];

export default function AutomationPage() {
  return (
    <>
      <MarketingNavigation />
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">Automation & Control</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Intelligent automation systems that optimize your operation 24/7
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {automationFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.href} className="bg-gray-900 rounded-xl p-8 border border-gray-800">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-purple-600/10 rounded-lg">
                      <Icon className="w-8 h-8 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {feature.features.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                        <div className="w-1 h-1 rounded-full bg-purple-400" />
                        {item}
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    href={feature.href}
                    className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-medium"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
