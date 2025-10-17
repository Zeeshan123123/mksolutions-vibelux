'use client';

import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { 
  Sparkles, Calculator, Layers, BarChart3, 
  Thermometer, Droplets, Zap, ArrowRight
} from 'lucide-react';

const tools = [
  {
    category: 'Design Tools',
    items: [
      {
        title: '3D Design Studio',
        description: 'Professional lighting design with real-time PPFD calculations',
        href: '/design',
        icon: Layers,
        color: 'purple'
      },
      {
        title: 'Advanced CAD Designer',
        description: 'Import DWG, Revit, and 60+ file formats',
        href: '/design/advanced',
        icon: Sparkles,
        color: 'blue'
      }
    ]
  },
  {
    category: 'Calculators',
    items: [
      {
        title: 'PPFD Calculator',
        description: 'Calculate photosynthetic photon flux density',
        href: '/calculators/ppfd',
        icon: Calculator,
        color: 'green'
      },
      {
        title: 'DLI Calculator',
        description: 'Daily light integral calculations',
        href: '/calculators/dli',
        icon: BarChart3,
        color: 'yellow'
      },
      {
        title: 'Environmental Suite',
        description: 'VPD, heat load, and climate calculations',
        href: '/calculators/environmental',
        icon: Thermometer,
        color: 'red'
      },
      {
        title: 'View All Calculators',
        description: '25+ professional calculators',
        href: '/calculators',
        icon: ArrowRight,
        color: 'gray'
      }
    ]
  }
];

export default function ToolsPage() {
  return (
    <>
      <MarketingNavigation />
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">Professional Tools</h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Industry-leading design tools and calculators for controlled environment agriculture
            </p>
          </div>

          {tools.map((category) => (
            <div key={category.category} className="mb-12">
              <h2 className="text-2xl font-bold mb-6">{category.category}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-purple-700/50 transition-all group"
                    >
                      <div className={`inline-flex p-3 bg-${tool.color}-600/10 rounded-lg mb-4`}>
                        <Icon className={`w-6 h-6 text-${tool.color}-400`} />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-gray-400">{tool.description}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
