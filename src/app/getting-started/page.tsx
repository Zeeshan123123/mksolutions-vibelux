'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Rocket, Leaf, Building, Users, ArrowRight, Check, 
  Clock, Target, BookOpen, Play, ChevronRight,
  Apple, Carrot, DollarSign, BarChart3, Droplets
} from 'lucide-react';

// Custom icon components for crops
const CannabisIcon = () => (
  <Leaf className="w-6 h-6 text-green-400" />
);

const TomatoIcon = () => (
  <div className="w-6 h-6 rounded-full bg-red-500" />
);

const LettuceIcon = () => (
  <Leaf className="w-6 h-6 text-emerald-400" />
);

const HerbIcon = () => (
  <Leaf className="w-6 h-6 text-lime-400" />
);

export default function GetStartedPage() {
  const [selectedRole, setSelectedRole] = useState<string>('cannabis-grower');

  const userRoles = [
    {
      id: 'cannabis-grower',
      name: 'Cannabis Grower',
      icon: CannabisIcon,
      description: 'Commercial cannabis cultivation',
      color: 'green'
    },
    {
      id: 'tomato-grower',
      name: 'Tomato Grower',
      icon: TomatoIcon,
      description: 'Greenhouse tomato production',
      color: 'red'
    },
    {
      id: 'leafy-greens',
      name: 'Leafy Greens',
      icon: LettuceIcon,
      description: 'Vertical farming & lettuce',
      color: 'emerald'
    },
    {
      id: 'consultant',
      name: 'Consultant',
      icon: Users,
      description: 'CEA consulting services',
      color: 'blue'
    },
    {
      id: 'investor',
      name: 'Investor',
      icon: DollarSign,
      description: 'Investment & partnerships',
      color: 'purple'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Building,
      description: 'Multi-site operations',
      color: 'indigo'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'bg-green-500/10 border-green-500/20 text-green-400',
      red: 'bg-red-500/10 border-red-500/20 text-red-400',
      emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
    };
    return colors[color as keyof typeof colors];
  };

  const renderGuide = () => {
    switch (selectedRole) {
      case 'cannabis-grower':
        return <CannabisGrowerGuide />;
      case 'tomato-grower':
        return <TomatoGrowerGuide />;
      case 'leafy-greens':
        return <LeafyGreensGuide />;
      case 'consultant':
        return <ConsultantGuide />;
      case 'investor':
        return <InvestorGuide />;
      case 'enterprise':
        return <EnterpriseGuide />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-900/20 to-gray-950 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Rocket className="w-10 h-10 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">Get Started with VibeLux</h1>
            </div>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Choose your role to see a customized guide for getting the most out of VibeLux
            </p>
          </div>
        </div>
      </div>

      {/* Role Selector */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {userRoles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`p-4 rounded-xl border transition-all ${
                  isSelected 
                    ? `${getColorClasses(role.color)} border-current`
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
              >
                <Icon />
                <h3 className="font-semibold text-white text-sm mt-2">{role.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{role.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guide Content */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        {renderGuide()}
      </div>
    </div>
  );
}

// Cannabis Grower Guide
function CannabisGrowerGuide() {
  return (
    <div className="space-y-12">
      {/* Quick Start */}
      <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Leaf className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Cannabis Grower Quick Start</h2>
            <p className="text-gray-400">
              Get your cannabis facility optimized in under 30 minutes
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <Clock className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">15 min</div>
            <p className="text-sm text-gray-400">Setup Time</p>
          </div>
          <div className="text-center">
            <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">20-40%</div>
            <p className="text-sm text-gray-400">Energy Savings</p>
          </div>
          <div className="text-center">
            <BarChart3 className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">15-25%</div>
            <p className="text-sm text-gray-400">Yield Increase</p>
          </div>
        </div>
      </div>

      {/* Step by Step Guide */}
      <div>
        <h3 className="text-xl font-bold text-white mb-6">Your First 7 Days</h3>
        
        <div className="space-y-4">
          {/* Day 1 */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 font-bold">1</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-2">Day 1: Account Setup & Baseline</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Create account and complete facility profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Use VPD Calculator to check current conditions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Run DLI Calculator for each room</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Enable METRC integration if applicable</span>
                  </li>
                </ul>
                <div className="mt-4 flex gap-2">
                  <Link href="/sign-up" className="text-sm text-green-400 hover:text-green-300">
                    Create Account →
                  </Link>
                  <Link href="/calculators/environmental" className="text-sm text-green-400 hover:text-green-300">
                    VPD Calculator →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Day 2-3 */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 font-bold">2-3</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-2">Day 2-3: Energy Optimization Setup</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Schedule energy assessment call</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Connect existing sensors (any brand)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Review utility rate structure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Set crop protection parameters</span>
                  </li>
                </ul>
                <div className="mt-4">
                  <Link href="/energy-optimization" className="text-sm text-green-400 hover:text-green-300">
                    Learn About Energy Savings →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Day 4-5 */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 font-bold">4-5</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-2">Day 4-5: Design & Planning Tools</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Try 3D Design Studio for next room</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Calculate optimal fixture count</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Use Fertigation Calculator</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Set up IPM tracking</span>
                  </li>
                </ul>
                <div className="mt-4">
                  <Link href="/design" className="text-sm text-green-400 hover:text-green-300">
                    Launch 3D Designer →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Day 6-7 */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 font-bold">6-7</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-2">Day 6-7: Advanced Features</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Explore Control Center modules</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Set up alerts and tasks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Review first energy optimization results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Schedule YEP consultation (optional)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div>
        <h3 className="text-xl font-bold text-white mb-6">Essential Features for Cannabis</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h4 className="font-semibold text-white mb-3">Compliance & Tracking</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• METRC/BioTrack integration</li>
              <li>• Automated compliance reporting</li>
              <li>• Complete audit trails</li>
              <li>• Multi-state support</li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h4 className="font-semibold text-white mb-3">Cannabis-Specific Calculators</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• VPD for each growth stage</li>
              <li>• DLI optimization (25-45 mol/m²/day)</li>
              <li>• Drying room conditions</li>
              <li>• Cost per gram tracking</li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h4 className="font-semibold text-white mb-3">Energy Management</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Never interrupts photoperiods</li>
              <li>• Protects critical flower weeks</li>
              <li>• Peak demand reduction</li>
              <li>• Utility rebate maximization</li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h4 className="font-semibold text-white mb-3">Yield Enhancement</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Strain-specific optimization</li>
              <li>• Environmental steering</li>
              <li>• Harvest timing optimization</li>
              <li>• Quality consistency tracking</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Saving?</h3>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          Join hundreds of cannabis facilities already using VibeLux to reduce costs and increase yields.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-up"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/how-it-works"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}

// Tomato Grower Guide
function TomatoGrowerGuide() {
  return (
    <div className="space-y-12">
      {/* Quick Start */}
      <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Tomato Grower Quick Start</h2>
            <p className="text-gray-400">
              Implement advanced Dutch cultivation methods immediately
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <Target className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">70 kg/m²</div>
            <p className="text-sm text-gray-400">Target Yield</p>
          </div>
          <div className="text-center">
            <Droplets className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">5 g/m³</div>
            <p className="text-sm text-gray-400">HD Target</p>
          </div>
          <div className="text-center">
            <BookOpen className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">40+ years</div>
            <p className="text-sm text-gray-400">Dutch Research</p>
          </div>
        </div>
      </div>

      {/* Dutch Research Tools */}
      <div>
        <h3 className="text-xl font-bold text-white mb-6">Essential Dutch Research Tools</h3>
        
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h4 className="font-semibold text-white mb-3">1. Plant Physiological Monitor</h4>
            <p className="text-gray-400 text-sm mb-4">
              Track head width (6-9.5mm target), VeGe balance, and exhaustion indicators
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400">Head Width</p>
                <p className="text-white font-medium">Weekly measurement</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400">Fruit Load</p>
                <p className="text-white font-medium">15-18 fruits ideal</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400">Stem Diameter</p>
                <p className="text-white font-medium">10-13mm target</p>
              </div>
            </div>
            <Link href="/calculators/environmental" className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 mt-4 text-sm">
              Launch Monitor
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h4 className="font-semibold text-white mb-3">2. IPM Dashboard</h4>
            <p className="text-gray-400 text-sm mb-4">
              Zero tolerance for spider mites, specific thresholds for whitefly and thrips
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-red-400" />
                <span>Weekly scouting protocols</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-red-400" />
                <span>Biocontrol release schedules</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-red-400" />
                <span>Threshold-based interventions</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h4 className="font-semibold text-white mb-3">3. Climate Control System</h4>
            <p className="text-gray-400 text-sm mb-4">
              P-Band temperature control with momentum prevention and HD optimization
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-red-400" />
                <span>Light-based temperature targets</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-red-400" />
                <span>8-9 air exchanges per hour</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-red-400" />
                <span>Semi-closed greenhouse optimization</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Implementation Timeline */}
      <div>
        <h3 className="text-xl font-bold text-white mb-6">30-Day Implementation Plan</h3>
        
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm text-red-400 font-medium">Week 1</div>
              <div className="flex-1">
                <p className="text-white font-medium">Baseline & Assessment</p>
                <p className="text-sm text-gray-400">Current metrics, VeGe balance check, nutrient analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm text-red-400 font-medium">Week 2</div>
              <div className="flex-1">
                <p className="text-white font-medium">Climate Optimization</p>
                <p className="text-sm text-gray-400">Implement P-Band control, HD targets, air exchange rates</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm text-red-400 font-medium">Week 3</div>
              <div className="flex-1">
                <p className="text-white font-medium">Nutrient & Water Management</p>
                <p className="text-sm text-gray-400">Adjust EC/pH targets, implement DLI-based irrigation</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 text-sm text-red-400 font-medium">Week 4</div>
              <div className="flex-1">
                <p className="text-white font-medium">Fine-tuning & Monitoring</p>
                <p className="text-sm text-gray-400">Adjust based on plant response, set up automated tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">Start Growing Like the Dutch</h3>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          Join leading greenhouse operations using VibeLux's Dutch research tools to achieve 70+ kg/m² yields.
        </p>
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          Get Started Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// Leafy Greens Guide (abbreviated for space)
function LeafyGreensGuide() {
  return (
    <div className="space-y-12">
      <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-4">Leafy Greens & Vertical Farming Guide</h2>
        <p className="text-gray-400 mb-6">
          Optimize your vertical farm or greenhouse lettuce production with tools designed for rapid crop cycles.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-white mb-3">Key Features</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• DLI optimization (12-17 mol/m²/day)</li>
              <li>• Multi-tier rack lighting design</li>
              <li>• 35-45 day crop cycle tracking</li>
              <li>• Water use efficiency monitoring</li>
              <li>• Food safety compliance tools</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-3">Quick Wins</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Reduce energy cost per head by 30%</li>
              <li>• Increase planting density 15-20%</li>
              <li>• Optimize spectrum for faster growth</li>
              <li>• Automate irrigation schedules</li>
              <li>• Track cost per head in real-time</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
          >
            Start Optimizing
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Consultant Guide (abbreviated)
function ConsultantGuide() {
  return (
    <div className="space-y-12">
      <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-4">Consultant Quick Start</h2>
        <p className="text-gray-400 mb-6">
          Leverage VibeLux tools to deliver more value to your clients and grow your consulting business.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-white mb-3">Client Management</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Multi-site dashboard</li>
              <li>• White-label reports</li>
              <li>• Shared project workspaces</li>
              <li>• Professional lighting designs</li>
              <li>• Energy savings calculations</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-3">Revenue Opportunities</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Referral commissions</li>
              <li>• Implementation services</li>
              <li>• Ongoing optimization</li>
              <li>• Training workshops</li>
              <li>• Custom reporting</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Partner With Us
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Investor Guide (abbreviated)
function InvestorGuide() {
  return (
    <div className="space-y-12">
      <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-4">Investor & Partnership Opportunities</h2>
        <p className="text-gray-400 mb-6">
          Multiple ways to participate in the rapidly growing controlled environment agriculture market.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-white mb-3">Investment Models</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Equipment financing partnerships</li>
              <li>• Revenue share opportunities</li>
              <li>• Energy savings participation</li>
              <li>• Facility co-investment</li>
              <li>• Technology licensing</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-3">Platform Benefits</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Real-time performance tracking</li>
              <li>• Risk assessment tools</li>
              <li>• Portfolio management</li>
              <li>• Automated reporting</li>
              <li>• Due diligence support</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Explore Opportunities
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// Enterprise Guide (abbreviated)
function EnterpriseGuide() {
  return (
    <div className="space-y-12">
      <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-4">Enterprise Implementation Guide</h2>
        <p className="text-gray-400 mb-6">
          Scale VibeLux across multiple facilities with enterprise-grade features and support.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-white mb-3">Enterprise Features</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Centralized multi-site dashboard</li>
              <li>• Role-based access control</li>
              <li>• Custom integrations</li>
              <li>• On-premise deployment options</li>
              <li>• SLA guarantees</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-3">Implementation Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Dedicated account team</li>
              <li>• Custom onboarding</li>
              <li>• Training programs</li>
              <li>• Priority support</li>
              <li>• Regular business reviews</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Schedule Demo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}