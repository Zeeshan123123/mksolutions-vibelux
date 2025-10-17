'use client';

import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import { 
  Rocket, Zap, Bug, Wrench, Star, ArrowRight, Calendar, 
  CheckCircle, Info, AlertTriangle, Package
} from 'lucide-react';

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: {
    type: 'feature' | 'improvement' | 'fix' | 'breaking';
    description: string;
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: '2.5.0',
    date: '2024-01-10',
    type: 'minor',
    changes: [
      { type: 'feature', description: 'Added blackout curtain control system with photoperiod management' },
      { type: 'feature', description: 'Enhanced CHP decision matrix with feed-in tariff pricing' },
      { type: 'feature', description: 'Multi-layer screen coordination for thermal and energy screens' },
      { type: 'improvement', description: 'Added comprehensive navigation to all marketing pages' },
      { type: 'fix', description: 'Fixed Clerk SSL certificate configuration issues' }
    ]
  },
  {
    version: '2.4.0',
    date: '2024-01-05',
    type: 'minor',
    changes: [
      { type: 'feature', description: 'Advanced Dutch Research tomato cultivation tools' },
      { type: 'feature', description: 'Quantum biotechnology gene expression modeling' },
      { type: 'feature', description: 'Equipment investment platform with smart escrow' },
      { type: 'improvement', description: 'Enhanced 3D visualization with biomass analysis' },
      { type: 'improvement', description: 'Upgraded maintenance ROI calculator' }
    ]
  },
  {
    version: '2.3.0',
    date: '2023-12-15',
    type: 'minor',
    changes: [
      { type: 'feature', description: 'AI-powered plant health diagnosis from photos' },
      { type: 'feature', description: 'Predictive maintenance with 92% accuracy' },
      { type: 'improvement', description: 'CAD import supporting 60+ file formats' },
      { type: 'improvement', description: 'Real-time collaboration with live cursors' },
      { type: 'fix', description: 'Fixed PPFD calculation accuracy issues' }
    ]
  },
  {
    version: '2.2.0',
    date: '2023-11-20',
    type: 'minor',
    changes: [
      { type: 'feature', description: 'Virtual Power Plant integration for energy trading' },
      { type: 'feature', description: 'Demand response program automation' },
      { type: 'improvement', description: 'Enhanced energy optimization algorithms' },
      { type: 'fix', description: 'Fixed mobile responsive issues on calculators' }
    ]
  },
  {
    version: '2.1.0',
    date: '2023-10-30',
    type: 'minor',
    changes: [
      { type: 'feature', description: 'Insurance marketplace with 12+ providers' },
      { type: 'feature', description: 'Parametric crop insurance integration' },
      { type: 'improvement', description: 'Faster 3D rendering performance' },
      { type: 'improvement', description: 'Enhanced fixture search capabilities' },
      { type: 'fix', description: 'Resolved data export formatting issues' }
    ]
  }
];

function getIcon(type: string) {
  switch (type) {
    case 'feature':
      return <Rocket className="w-4 h-4 text-green-400" />;
    case 'improvement':
      return <Zap className="w-4 h-4 text-blue-400" />;
    case 'fix':
      return <Bug className="w-4 h-4 text-red-400" />;
    case 'breaking':
      return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    default:
      return <Info className="w-4 h-4 text-gray-400" />;
  }
}

function getVersionBadge(type: string) {
  switch (type) {
    case 'major':
      return 'bg-red-600 text-white';
    case 'minor':
      return 'bg-blue-600 text-white';
    case 'patch':
      return 'bg-gray-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
}

export default function ChangelogPage() {
  return (
    <>
      <MarketingNavigation />
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-purple-900/20 to-gray-950 py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 rounded-full border border-purple-700/50 mb-6">
              <Package className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-200">Product Updates</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-6">Changelog</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Track every improvement, feature, and fix. We're constantly evolving VibeLux 
              to meet your growing needs.
            </p>
          </div>
        </div>

        {/* Changelog Entries */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="space-y-12">
            {changelog.map((entry, index) => (
              <div key={index} className="relative">
                {/* Timeline line */}
                {index < changelog.length - 1 && (
                  <div className="absolute left-8 top-16 w-0.5 h-full bg-gray-800" />
                )}
                
                {/* Entry */}
                <div className="flex gap-6">
                  {/* Timeline dot */}
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-900 rounded-full border-4 border-gray-800 flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-400" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 bg-gray-900 rounded-xl p-6 border border-gray-800">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold">Version {entry.version}</h2>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${getVersionBadge(entry.type)}`}>
                            {entry.type.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(entry.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Changes */}
                    <div className="space-y-2">
                      {entry.changes.map((change, changeIndex) => (
                        <div key={changeIndex} className="flex items-start gap-3">
                          {getIcon(change.type)}
                          <p className="text-gray-300">{change.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Subscribe Section */}
          <div className="mt-16 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
            <p className="text-gray-300 mb-6">
              Get notified about new features and updates as soon as they're released.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
              <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors inline-flex items-center gap-2">
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}