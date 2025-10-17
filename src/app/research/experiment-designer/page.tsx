'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/client-logger';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
  ArrowLeft, FlaskConical, Target, Users, Calendar,
  Settings, CheckCircle, AlertTriangle, Lock,
  BarChart3, Lightbulb, BookOpen, Save,
  Play, Download, Grid3x3, Shuffle, X
} from 'lucide-react';
import { TrialDesignWizard } from '@/components/TrialDesignWizard';
import ExperimentDesigner from '@/components/research/ExperimentDesigner';

export default function ExperimentDesignerPage() {
  const router = useRouter();
  const { canAccessFeature } = useSubscription();
  const [showWizard, setShowWizard] = useState(false);
  const [showAdvancedDesigner, setShowAdvancedDesigner] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Check access to research suite
  const hasAccess = canAccessFeature('research-suite');
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-purple-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Research Suite Required</h1>
            <p className="text-gray-400">
              Design statistically rigorous experiments with our advanced planning tools.
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 mb-6 text-left">
            <h3 className="text-lg font-semibold text-white mb-3">Experimental Design Features:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Randomized Complete Block Design (RCBD)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Factorial & Split-Plot Designs
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Power Analysis & Sample Size Calculator
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Randomization & Blocking
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Protocol Generation & Export
              </li>
            </ul>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/pricing#research')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
            >
              Get Research Suite - $399/mo
            </button>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const experimentTemplates = [
    {
      id: 'yield-comparison',
      name: 'Yield Comparison Trial',
      description: 'Compare yield outcomes across different treatments',
      design: 'Randomized Complete Block',
      icon: Target,
      factors: 1,
      levels: '3-5',
      replicates: '4-6',
    },
    {
      id: 'factorial-light-nutrient',
      name: 'Light × Nutrient Factorial',
      description: 'Test interactions between light levels and nutrient concentrations',
      design: '2×3 Factorial',
      icon: Grid3x3,
      factors: 2,
      levels: '2×3',
      replicates: '3-4',
    },
    {
      id: 'cultivar-screening',
      name: 'Cultivar Screening',
      description: 'Screen multiple cultivars for performance',
      design: 'Augmented Design',
      icon: Users,
      factors: 1,
      levels: '10+',
      replicates: '2-3',
    },
    {
      id: 'time-series',
      name: 'Growth Time Series',
      description: 'Track growth parameters over time',
      design: 'Repeated Measures',
      icon: Calendar,
      factors: 1,
      levels: 'Continuous',
      replicates: '5-10',
    },
  ];
  
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/research"
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Experimental Design Wizard</h1>
                <p className="text-gray-400 text-sm">Plan statistically rigorous experiments</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                View Guides
              </button>
              <button 
                onClick={() => setShowAdvancedDesigner(true)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Advanced Designer
              </button>
              <button 
                onClick={() => setShowWizard(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start New Design
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Active Trials</span>
              <FlaskConical className="w-4 h-4 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">3</div>
            <div className="text-sm text-gray-500">2 in progress</div>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Completed</span>
              <CheckCircle className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">12</div>
            <div className="text-sm text-gray-500">This year</div>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Success Rate</span>
              <Target className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">87%</div>
            <div className="text-sm text-gray-500">Significant results</div>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Avg. Power</span>
              <BarChart3 className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white">0.85</div>
            <div className="text-sm text-gray-500">Statistical power</div>
          </div>
        </div>
        
        {/* Template Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Choose Experiment Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experimentTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    setShowWizard(true);
                  }}
                  className="bg-gray-900 hover:bg-gray-800 rounded-xl p-6 border border-gray-800 transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                      <Icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{template.name}</h3>
                      <p className="text-gray-400 text-sm mb-3">{template.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Design:</span>
                          <span className="text-gray-300">{template.design}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Factors:</span>
                          <span className="text-gray-300">{template.factors}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Levels:</span>
                          <span className="text-gray-300">{template.levels}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Recent Experiments */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Recent Experiments
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">LED Spectrum Comparison</h4>
                  <p className="text-sm text-gray-400">RCBD, 4 treatments × 5 replicates</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">Active</span>
                <button 
                  onClick={() => {/* TODO: Implement experiment settings */}}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Experiment Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Grid3x3 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">DLI × EC Factorial</h4>
                  <p className="text-sm text-gray-400">3×3 Factorial, 4 replicates</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full">Analysis</span>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-600/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">Cultivar Screening 2024</h4>
                  <p className="text-sm text-gray-400">Augmented design, 24 cultivars</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-full">Complete</span>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Power Analysis Tool */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Quick Power Analysis
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Effect Size</label>
              <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                <option>Small (0.25)</option>
                <option selected>Medium (0.5)</option>
                <option>Large (0.8)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Significance Level</label>
              <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                <option>0.01</option>
                <option selected>0.05</option>
                <option>0.10</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Power</label>
              <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                <option>0.70</option>
                <option selected>0.80</option>
                <option>0.90</option>
                <option>0.95</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Required Sample Size</label>
              <div className="px-3 py-2 bg-purple-600/20 border border-purple-500/50 rounded-lg">
                <span className="text-xl font-bold text-purple-400">64</span>
                <span className="text-sm text-purple-300 ml-1">per group</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Trial Design Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <TrialDesignWizard
              onTrialCreate={(trial) => {
                logger.info('system', 'New trial created:', { data: trial });
                setShowWizard(false);
                // Here you would save the trial and redirect
              }}
              onClose={() => setShowWizard(false)}
            />
          </div>
        </div>
      )}
      
      {/* Advanced Designer Modal */}
      {showAdvancedDesigner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Advanced Experiment Designer</h2>
              <button
                onClick={() => setShowAdvancedDesigner(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <ExperimentDesigner
              onDesignCreated={(design) => {
                logger.info('system', 'Design created:', { data: design });
                // Here you would save the design
              }}
              onSaveDesign={(design) => {
                logger.info('system', 'Design saved:', { data: design });
                setShowAdvancedDesigner(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}