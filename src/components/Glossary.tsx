'use client';

import { useState } from 'react';
import { Search, Book, ExternalLink, ChevronRight } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'lighting' | 'cultivation' | 'technology' | 'business' | 'energy';
  relatedTerms?: string[];
  learnMoreUrl?: string;
}

const glossaryData: GlossaryTerm[] = [
  // Lighting Terms
  {
    term: 'PPFD',
    definition: 'Photosynthetic Photon Flux Density - The amount of photosynthetically active radiation (PAR) that actually reaches your plants, measured in micromoles per square meter per second (μmol/m²/s).',
    category: 'lighting',
    relatedTerms: ['PAR', 'DLI', 'PPF']
  },
  {
    term: 'DLI',
    definition: 'Daily Light Integral - The total amount of PAR delivered to plants over a 24-hour period, measured in moles per square meter per day (mol/m²/d).',
    category: 'lighting',
    relatedTerms: ['PPFD', 'Photoperiod']
  },
  {
    term: 'PPF',
    definition: 'Photosynthetic Photon Flux - The total amount of PAR produced by a light source per second, measured in micromoles per second (μmol/s).',
    category: 'lighting',
    relatedTerms: ['PPFD', 'Efficacy']
  },
  {
    term: 'Efficacy',
    definition: 'The efficiency of a light fixture, measured as PPF output per watt of electrical input (μmol/J or PPF/W).',
    category: 'lighting',
    relatedTerms: ['PPF', 'Energy Efficiency']
  },
  {
    term: 'Photoperiod',
    definition: 'The duration of light exposure plants receive in a 24-hour period, crucial for controlling vegetative growth and flowering.',
    category: 'lighting',
    relatedTerms: ['DLI', 'Photoperiodism']
  },
  
  // Cultivation Terms
  {
    term: 'VPD',
    definition: 'Vapor Pressure Deficit - The difference between the amount of moisture in the air and how much moisture the air can hold when saturated. Critical for optimizing transpiration and nutrient uptake.',
    category: 'cultivation',
    relatedTerms: ['Transpiration', 'RH', 'Temperature']
  },
  {
    term: 'EC',
    definition: 'Electrical Conductivity - A measure of the salt/nutrient concentration in your growing solution, typically measured in mS/cm or dS/m.',
    category: 'cultivation',
    relatedTerms: ['TDS', 'pH', 'Nutrients']
  },
  {
    term: 'IPM',
    definition: 'Integrated Pest Management - A holistic approach to pest control that combines biological, cultural, physical, and chemical tools to minimize economic, health, and environmental risks.',
    category: 'cultivation',
    relatedTerms: ['Beneficial Insects', 'Scouting']
  },
  {
    term: 'Transpiration',
    definition: 'The process by which water moves through a plant and evaporates from leaves, stems, and flowers. Essential for nutrient uptake and temperature regulation.',
    category: 'cultivation',
    relatedTerms: ['VPD', 'Stomata', 'Water Use Efficiency']
  },
  {
    term: 'Fertigation',
    definition: 'The injection of fertilizers, soil amendments, and other water-soluble products into an irrigation system.',
    category: 'cultivation',
    relatedTerms: ['EC', 'pH', 'Drip Irrigation']
  },
  
  // Technology Terms
  {
    term: 'SCADA',
    definition: 'Supervisory Control and Data Acquisition - A control system architecture used for monitoring and controlling facility processes in real-time.',
    category: 'technology',
    relatedTerms: ['PLC', 'HMI', 'Automation']
  },
  {
    term: 'BMS',
    definition: 'Building Management System - Computer-based control system that monitors and manages mechanical and electrical equipment in facilities.',
    category: 'technology',
    relatedTerms: ['HVAC', 'Energy Management', 'SCADA']
  },
  {
    term: 'API',
    definition: 'Application Programming Interface - A set of protocols and tools that allows different software applications to communicate with each other.',
    category: 'technology',
    relatedTerms: ['Integration', 'Webhook', 'REST']
  },
  {
    term: 'IoT',
    definition: 'Internet of Things - Network of physical devices embedded with sensors and software that connect and exchange data over the internet.',
    category: 'technology',
    relatedTerms: ['Sensors', 'Automation', 'Data Analytics']
  },
  {
    term: 'Digital Twin',
    definition: 'A virtual representation of a physical facility that uses real-time data to enable understanding, learning, and reasoning about the system.',
    category: 'technology',
    relatedTerms: ['Simulation', 'Predictive Analytics', 'IoT']
  },
  
  // Energy Terms
  {
    term: 'kWh',
    definition: 'Kilowatt-hour - A unit of energy equal to one kilowatt of power consumed for one hour. Used for measuring electrical energy consumption.',
    category: 'energy',
    relatedTerms: ['Power Factor', 'Demand Charge', 'Energy Cost']
  },
  {
    term: 'Demand Charge',
    definition: 'Fee based on the highest amount of power drawn during a billing period, typically measured in kW. Can represent 30-70% of commercial electric bills.',
    category: 'energy',
    relatedTerms: ['Peak Hours', 'Load Management', 'kWh']
  },
  {
    term: 'Power Factor',
    definition: 'Ratio of real power to apparent power in an electrical system. Poor power factor can result in additional utility charges.',
    category: 'energy',
    relatedTerms: ['Reactive Power', 'Efficiency', 'Electrical Load']
  },
  {
    term: 'Peak Hours',
    definition: 'Times of day when electricity demand and costs are highest, typically during business hours when commercial and industrial use peaks.',
    category: 'energy',
    relatedTerms: ['TOU Rates', 'Demand Response', 'Load Shifting']
  },
  
  // Business Terms
  {
    term: 'ROI',
    definition: 'Return on Investment - A performance measure used to evaluate the efficiency of an investment, calculated as (Gain - Cost) / Cost × 100%.',
    category: 'business',
    relatedTerms: ['Payback Period', 'TCO', 'NPV']
  },
  {
    term: 'TCO',
    definition: 'Total Cost of Ownership - Complete cost of acquiring, operating, and maintaining equipment over its lifetime.',
    category: 'business',
    relatedTerms: ['ROI', 'OpEx', 'CapEx']
  },
  {
    term: 'SaaS',
    definition: 'Software as a Service - Software distribution model where applications are hosted by a vendor and provided to customers over the internet.',
    category: 'business',
    relatedTerms: ['Subscription', 'Cloud Computing', 'API']
  }
];

export function Glossary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', name: 'All Terms', color: 'bg-gray-500' },
    { id: 'lighting', name: 'Lighting', color: 'bg-yellow-500' },
    { id: 'cultivation', name: 'Cultivation', color: 'bg-green-500' },
    { id: 'technology', name: 'Technology', color: 'bg-blue-500' },
    { id: 'energy', name: 'Energy', color: 'bg-orange-500' },
    { id: 'business', name: 'Business', color: 'bg-purple-500' }
  ];

  const filteredTerms = glossaryData.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleTerm = (term: string) => {
    setExpandedTerms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(term)) {
        newSet.delete(term);
      } else {
        newSet.add(term);
      }
      return newSet;
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lighting': return 'text-yellow-400 bg-yellow-500/20';
      case 'cultivation': return 'text-green-400 bg-green-500/20';
      case 'technology': return 'text-blue-400 bg-blue-500/20';
      case 'energy': return 'text-orange-400 bg-orange-500/20';
      case 'business': return 'text-purple-400 bg-purple-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
          <Book className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-400">Knowledge Base</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Glossary of Terms</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Understanding the language of controlled environment agriculture
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search terms or definitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category.name}
              {category.id !== 'all' && (
                <span className="ml-2 text-sm opacity-75">
                  ({glossaryData.filter(t => t.category === category.id).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Terms List */}
      <div className="space-y-4">
        {filteredTerms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No terms found matching your search.</p>
          </div>
        ) : (
          filteredTerms.map((item) => (
            <div
              key={item.term}
              className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => toggleTerm(item.term)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                  <h3 className="text-lg font-semibold text-white">{item.term}</h3>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedTerms.has(item.term) ? 'rotate-90' : ''
                }`} />
              </button>

              {expandedTerms.has(item.term) && (
                <div className="px-6 pb-4 border-t border-gray-700">
                  <p className="text-gray-300 mt-4">{item.definition}</p>
                  
                  {item.relatedTerms && item.relatedTerms.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-400 mb-2">Related Terms:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.relatedTerms.map(relatedTerm => (
                          <button
                            key={relatedTerm}
                            onClick={() => {
                              setSearchTerm(relatedTerm);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                          >
                            {relatedTerm}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.learnMoreUrl && (
                    <a
                      href={item.learnMoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 text-purple-400 hover:text-purple-300 text-sm"
                    >
                      Learn more <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Help Section */}
      <div className="mt-12 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-2">
          Can't find what you're looking for?
        </h3>
        <p className="text-gray-400 mb-4">
          Our glossary is constantly growing. If you need clarification on a term not listed here, 
          please don't hesitate to reach out.
        </p>
        <a
          href="/contact"
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Contact Support <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}