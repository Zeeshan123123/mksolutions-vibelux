'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import { 
  Search, Book, ArrowRight, Info, ChevronRight,
  Lightbulb, Droplets, Thermometer, Leaf, FlaskConical,
  Activity, Shield, Calculator, Brain, Database
} from 'lucide-react';

interface GlossaryTerm {
  term: string;
  acronym?: string;
  category: string;
  definition: string;
  formula?: string;
  example?: string;
  relatedTerms?: string[];
  learnMore?: string;
}

const glossaryTerms: GlossaryTerm[] = [
  // Lighting Terms
  {
    term: "Daily Light Integral",
    acronym: "DLI",
    category: "Lighting",
    definition: "The total amount of photosynthetically active radiation (PAR) delivered to plants over a 24-hour period. Measured in mol/m²/day.",
    formula: "DLI = PPFD × Photoperiod (hours) × 3.6 ÷ 1000",
    example: "Cannabis typically requires 25-45 DLI in flower, while lettuce needs 12-17 DLI.",
    relatedTerms: ["PPFD", "PAR", "Photoperiod"],
    learnMore: "/calculators/lighting"
  },
  {
    term: "Photosynthetic Photon Flux Density",
    acronym: "PPFD",
    category: "Lighting",
    definition: "The amount of photosynthetically active radiation (PAR) hitting a surface per second. Measured in μmol/m²/s.",
    example: "Cannabis flowering typically requires 600-900 PPFD at canopy level.",
    relatedTerms: ["DLI", "PAR", "PPF"],
    learnMore: "/calculators/lighting"
  },
  {
    term: "Photosynthetically Active Radiation",
    acronym: "PAR",
    category: "Lighting",
    definition: "Light wavelengths from 400-700nm that plants use for photosynthesis. This is the spectrum of light that drives plant growth.",
    relatedTerms: ["PPFD", "PPF", "Spectrum"]
  },
  {
    term: "Photosynthetic Photon Flux",
    acronym: "PPF",
    category: "Lighting",
    definition: "The total amount of PAR light emitted by a fixture per second. Measured in μmol/s. This is the fixture's total light output.",
    example: "A 600W LED might produce 1620 PPF (2.7 μmol/J efficacy).",
    relatedTerms: ["PPFD", "Efficacy"]
  },
  {
    term: "Photoperiod",
    category: "Lighting",
    definition: "The duration of light exposure plants receive in a 24-hour period. Critical for controlling vegetative growth and flowering.",
    example: "18/6 for veg (18 hours light, 6 dark), 12/12 for flower.",
    relatedTerms: ["DLI", "Flowering"]
  },

  // Environmental Terms
  {
    term: "Vapor Pressure Deficit",
    acronym: "VPD",
    category: "Environmental",
    definition: "The difference between the amount of moisture in the air and how much moisture the air can hold when saturated. Controls transpiration rate.",
    formula: "VPD = SVP - AVP (in kPa)",
    example: "Optimal VPD: 0.8-1.2 kPa in veg, 1.2-1.6 kPa in flower.",
    relatedTerms: ["RH", "Temperature", "Transpiration"],
    learnMore: "/calculators/environmental"
  },
  {
    term: "Relative Humidity",
    acronym: "RH",
    category: "Environmental",
    definition: "The amount of water vapor in the air expressed as a percentage of the maximum amount the air could hold at that temperature.",
    example: "Seedlings: 65-70% RH, Flowering: 40-50% RH.",
    relatedTerms: ["VPD", "Dew Point", "Temperature"]
  },
  {
    term: "Electrical Conductivity",
    acronym: "EC",
    category: "Water/Nutrients",
    definition: "A measure of the salt/nutrient concentration in water or growing media. Higher EC means more dissolved nutrients.",
    formula: "EC (mS/cm) = PPM ÷ 500 (or 700 depending on meter)",
    example: "Cannabis feed: 1.5-2.5 EC, Tomatoes: 2.0-3.5 EC.",
    relatedTerms: ["PPM", "TDS", "pH"]
  },
  {
    term: "Parts Per Million",
    acronym: "PPM",
    category: "Water/Nutrients",
    definition: "Concentration of dissolved nutrients in water. 1 PPM = 1mg/L. Different meters use different conversion factors from EC.",
    relatedTerms: ["EC", "TDS", "Nutrient Strength"]
  },
  {
    term: "Potential of Hydrogen",
    acronym: "pH",
    category: "Water/Nutrients",
    definition: "Measure of acidity or alkalinity on a 0-14 scale. 7 is neutral, below 7 is acidic, above 7 is alkaline. Critical for nutrient availability.",
    example: "Cannabis optimal: 5.8-6.3 in hydro, 6.0-7.0 in soil.",
    relatedTerms: ["EC", "Nutrient Lockout"]
  },

  // Dutch Research Terms
  {
    term: "Vegetative-Generative Balance",
    acronym: "VeGe",
    category: "Dutch Research",
    definition: "The balance between vegetative growth (leaves, stems) and generative growth (flowers, fruits). Key concept in Dutch tomato cultivation.",
    example: "Too vegetative: thick stems, large leaves, few fruits. Too generative: thin stems, small leaves, small fruits.",
    relatedTerms: ["Plant Load", "Steering"],
    learnMore: "/calculators/environmental"
  },
  {
    term: "Humidity Deficit",
    acronym: "HD",
    category: "Dutch Research",
    definition: "Absolute humidity difference between inside and outside air. Used in Dutch greenhouse climate control. Measured in g/m³.",
    formula: "HD = Absolute Humidity Inside - Absolute Humidity Outside",
    example: "Target HD: 5 g/m³ for optimal transpiration.",
    relatedTerms: ["VPD", "Transpiration"]
  },
  {
    term: "P-Band Climate Control",
    category: "Dutch Research",
    definition: "Proportional band control that gradually adjusts heating/cooling based on temperature deviation from setpoint. Prevents overshooting.",
    example: "2°C P-band: heating starts reducing as temp approaches setpoint.",
    relatedTerms: ["Climate Control", "Temperature Integration"]
  },
  {
    term: "Plant Load",
    category: "Dutch Research",
    definition: "The number of fruits/flowers a plant is supporting. Higher plant load pushes the plant more generative.",
    example: "Tomatoes: 15-18 fruits per plant is moderate load.",
    relatedTerms: ["VeGe Balance", "Fruit Set"]
  },
  {
    term: "Climate Integration",
    category: "Dutch Research",
    definition: "Allowing temperature to vary within a range over 24 hours while maintaining the same average. Saves energy while maintaining growth.",
    example: "Instead of constant 24°C, allow 22-26°C variation.",
    relatedTerms: ["P-Band", "Energy Optimization"]
  },

  // Cultivation Terms
  {
    term: "Integrated Pest Management",
    acronym: "IPM",
    category: "Cultivation",
    definition: "Systematic approach to pest control using multiple strategies: prevention, monitoring, biological controls, and targeted treatments.",
    example: "Weekly scouting, beneficial insects, environmental controls.",
    relatedTerms: ["Biological Control", "Threshold", "Scouting"]
  },
  {
    term: "METRC",
    category: "Compliance",
    definition: "Marijuana Enforcement Tracking Reporting Compliance - seed-to-sale tracking system used in multiple US states for cannabis.",
    relatedTerms: ["BioTrack", "Compliance", "Track and Trace"]
  },
  {
    term: "Water Use Efficiency",
    acronym: "WUE",
    category: "Water/Nutrients",
    definition: "Amount of biomass produced per unit of water consumed. Key metric for sustainability and profitability.",
    formula: "WUE = Yield (g) ÷ Water Used (L)",
    example: "Modern greenhouses achieve 30-50g tomatoes per liter.",
    relatedTerms: ["Transpiration", "VPD"]
  },
  {
    term: "Leaf Area Index",
    acronym: "LAI",
    category: "Cultivation",
    definition: "Total one-sided leaf area per unit ground surface area. Indicates canopy density and light interception.",
    formula: "LAI = Total Leaf Area ÷ Ground Area",
    example: "Optimal LAI for tomatoes: 3-4.",
    relatedTerms: ["Canopy Management", "Light Penetration"]
  },

  // Technical/Platform Terms
  {
    term: "DesignLights Consortium",
    acronym: "DLC",
    category: "Technical",
    definition: "Organization that qualifies commercial lighting products for efficiency and performance. DLC listing often required for utility rebates.",
    relatedTerms: ["QPL", "Rebates", "Efficacy"],
    learnMore: "/design"
  },
  {
    term: "Qualified Products List",
    acronym: "QPL",
    category: "Technical",
    definition: "DLC's database of tested and qualified lighting fixtures. VibeLux integrates this data for accurate lighting designs.",
    relatedTerms: ["DLC", "Photometric Data"]
  },
  {
    term: "Yield Enhancement Protocol",
    acronym: "YEP",
    category: "VibeLux Features",
    definition: "VibeLux's systematic approach to increasing yields through optimized genetics, environment, nutrition, pest management, and harvest timing.",
    example: "15-25% yield increase over 6-12 months.",
    relatedTerms: ["Optimization", "Protocol"],
    learnMore: "/how-it-works"
  },
  {
    term: "Growing as a Service",
    acronym: "GaaS",
    category: "VibeLux Features",
    definition: "VibeLux's zero-upfront-cost model where you pay only from energy savings or yield improvements. No savings = no payment.",
    relatedTerms: ["Energy Optimization", "Revenue Share"],
    learnMore: "/how-it-works"
  },

  // Energy Terms
  {
    term: "Demand Response",
    acronym: "DR",
    category: "Energy",
    definition: "Programs where utilities pay you to reduce energy use during peak demand periods. VibeLux automates participation.",
    example: "Earn $1,000-5,000/month by reducing load during peak hours.",
    relatedTerms: ["Peak Hours", "Load Shedding"]
  },
  {
    term: "Power Usage Effectiveness",
    acronym: "PUE",
    category: "Energy",
    definition: "Ratio of total facility energy to energy used by cultivation equipment. Lower is better. Industry average: 1.5-2.0.",
    formula: "PUE = Total Facility Energy ÷ Cultivation Equipment Energy",
    relatedTerms: ["Energy Efficiency", "HVAC"]
  },
  {
    term: "Peak Demand",
    category: "Energy",
    definition: "The highest amount of electricity used during a billing period. Often charged at premium rates. Major cost driver.",
    example: "Reducing peak by 100kW can save $1,500/month.",
    relatedTerms: ["Demand Charge", "Load Management"]
  },

  // Greenhouse Specific
  {
    term: "Semi-Closed Greenhouse",
    category: "Greenhouse",
    definition: "Greenhouse design that recirculates air through climate chambers, allowing better climate control and energy efficiency.",
    relatedTerms: ["Air Exchanges", "Climate Control"]
  },
  {
    term: "Drain Percentage",
    category: "Water/Nutrients",
    definition: "Percentage of irrigation water that drains from the growing media. Indicates irrigation efficiency and salt management.",
    formula: "Drain % = (Drain Volume ÷ Input Volume) × 100",
    example: "Target 20-30% drain in peak summer.",
    relatedTerms: ["EC", "Irrigation Strategy"]
  },
  {
    term: "Stem Diameter",
    category: "Cultivation",
    definition: "Weekly measurement of plant stem thickness. Key indicator of plant balance and vigor in Dutch cultivation.",
    example: "Tomato target: 10-13mm at growing point.",
    relatedTerms: ["VeGe Balance", "Plant Load"]
  }
];

const categories = [...new Set(glossaryTerms.map(term => term.category))].sort();

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());

  const filteredTerms = glossaryTerms.filter(term => {
    const matchesSearch = searchQuery === '' || 
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (term.acronym && term.acronym.toLowerCase().includes(searchQuery.toLowerCase())) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || term.category === selectedCategory;

    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.term.localeCompare(b.term));

  const toggleExpanded = (term: string) => {
    const newExpanded = new Set(expandedTerms);
    if (newExpanded.has(term)) {
      newExpanded.delete(term);
    } else {
      newExpanded.add(term);
    }
    setExpandedTerms(newExpanded);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Lighting': return <Lightbulb className="w-5 h-5" />;
      case 'Environmental': return <Thermometer className="w-5 h-5" />;
      case 'Water/Nutrients': return <Droplets className="w-5 h-5" />;
      case 'Dutch Research': return <FlaskConical className="w-5 h-5" />;
      case 'Cultivation': return <Leaf className="w-5 h-5" />;
      case 'Energy': return <Activity className="w-5 h-5" />;
      case 'Compliance': return <Shield className="w-5 h-5" />;
      case 'Technical': return <Brain className="w-5 h-5" />;
      case 'VibeLux Features': return <Database className="w-5 h-5" />;
      default: return <Book className="w-5 h-5" />;
    }
  };

  return (
    <>
      <MarketingNavigation />
      <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-900/20 to-gray-950 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Book className="w-10 h-10 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">VibeLux Glossary</h1>
            </div>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Master the terminology of controlled environment agriculture
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {glossaryTerms.length} terms explained
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search terms, acronyms, or definitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-5xl mx-auto px-6 pb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === null
                ? 'bg-purple-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {getCategoryIcon(category)}
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Terms List */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="space-y-4">
          {filteredTerms.map((term) => {
            const isExpanded = expandedTerms.has(term.term);
            
            return (
              <div
                key={term.term}
                className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
              >
                <button
                  onClick={() => toggleExpanded(term.term)}
                  className="w-full px-6 py-4 flex items-start justify-between text-left hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-white">
                        {term.term}
                        {term.acronym && (
                          <span className="text-purple-400 ml-2">({term.acronym})</span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 text-xs">
                        {getCategoryIcon(term.category)}
                        <span className="text-gray-400">{term.category}</span>
                      </div>
                    </div>
                    <p className="text-gray-400 line-clamp-2">{term.definition}</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 flex-shrink-0 mt-1 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`} />
                </button>
                
                {isExpanded && (
                  <div className="px-6 pb-4 space-y-3">
                    {term.formula && (
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Formula:</p>
                        <code className="text-sm text-purple-400 font-mono">{term.formula}</code>
                      </div>
                    )}
                    
                    {term.example && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Example:</p>
                        <p className="text-sm text-gray-300">{term.example}</p>
                      </div>
                    )}
                    
                    {term.relatedTerms && term.relatedTerms.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Related Terms:</p>
                        <div className="flex flex-wrap gap-2">
                          {term.relatedTerms.map(related => (
                            <button
                              key={related}
                              onClick={() => {
                                setSearchQuery(related);
                                setSelectedCategory(null);
                              }}
                              className="text-xs px-2 py-1 bg-gray-800 text-purple-400 rounded hover:bg-gray-700 transition-colors"
                            >
                              {related}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {term.learnMore && (
                      <Link
                        href={term.learnMore}
                        className="inline-flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        Learn more
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredTerms.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No terms found matching your search.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="mt-4 text-purple-400 hover:text-purple-300"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Educational CTA */}
      <div className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">Ready to Apply This Knowledge?</h2>
            <p className="text-gray-400">
              Use VibeLux's professional calculators and tools to optimize your grow
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link 
                href="/calculators"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
              >
                Explore Calculators
                <Calculator className="w-4 h-4" />
              </Link>
              <Link 
                href="/sign-up"
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
}