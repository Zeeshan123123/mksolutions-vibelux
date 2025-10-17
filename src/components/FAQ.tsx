'use client';

import { useState } from 'react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Getting Started
  {
    category: 'Getting Started',
    question: 'How much does VibeLux cost?',
    answer: 'VibeLux offers flexible pricing starting at $299/month for small facilities. We also offer a unique "Growing as a Service" model where you pay nothing upfront - we share in your energy savings or yield improvements. Enterprise pricing is available for multi-facility operations. All plans include a 14-day free trial.'
  },
  {
    category: 'Getting Started',
    question: 'Do I need to replace my existing equipment?',
    answer: 'No! VibeLux works with your existing equipment. We integrate with virtually any sensor, controller, or lighting system you already have. Our platform is hardware-agnostic and designed to optimize what you\'re already using.'
  },
  {
    category: 'Getting Started',
    question: 'How long does setup take?',
    answer: 'Basic setup takes about 30 minutes. This includes creating your account, setting up your first facility, and connecting sensors. Full implementation with all features typically takes 1-2 days with our guided onboarding process. Our team is available to help every step of the way.'
  },
  {
    category: 'Getting Started',
    question: 'What kind of support do you offer?',
    answer: 'We provide comprehensive support including: live chat (Mon-Fri 9am-5pm EST), email support with <24hr response time, extensive documentation, video tutorials, and dedicated account managers for Pro and Enterprise plans. We also offer professional services for custom implementations.'
  },

  // Features & Capabilities
  {
    category: 'Features',
    question: 'What makes VibeLux different from other platforms?',
    answer: 'VibeLux combines professional-grade tools typically found in separate expensive software into one integrated platform. Our AI-powered optimization, 60+ CAD format support, research-based calculators, and energy optimization algorithms are unique in the industry. Plus, our "Growing as a Service" model means you only pay when you save.'
  },
  {
    category: 'Features',
    question: 'Can VibeLux help me save on energy costs?',
    answer: 'Yes! Our platform helps reduce energy costs through peak demand management, time-of-use optimization, and intelligent scheduling. The platform identifies your biggest cost drivers and provides actionable recommendations to help optimize your energy usage and reduce costs.'
  },
  {
    category: 'Features',
    question: 'What types of facilities can use VibeLux?',
    answer: 'VibeLux supports all controlled environment agriculture facilities including: cannabis cultivation (indoor/greenhouse), vertical farms, research facilities, traditional greenhouses, hydroponic operations, and mushroom cultivation. We have specific features for each facility type.'
  },
  {
    category: 'Features',
    question: 'Does VibeLux work with my existing sensors?',
    answer: 'Yes! We support 100+ sensor brands and all major protocols including MQTT, Modbus (TCP/RTU), BACnet, OPC UA, and simple HTTP APIs. Popular brands like Aranet, HOBO, Trolmaster, Argus, and Priva work out of the box. We can also integrate custom sensors.'
  },

  // Technical Questions
  {
    category: 'Technical',
    question: 'How does the AI lighting optimization work?',
    answer: 'Our AI analyzes your facility layout, crop requirements, and energy costs to optimize fixture placement and scheduling. It considers factors like DLI targets, uniformity requirements, heat load, and energy rates. The AI uses machine learning algorithms to provide data-driven recommendations.'
  },
  {
    category: 'Technical',
    question: 'What CAD file formats do you support?',
    answer: 'We support 60+ CAD formats including: AutoCAD (DWG/DXF), Revit (RVT/RFA), SketchUp (SKP), IFC BIM files, STEP/IGES, Rhino (3DM), ArchiCAD, and many more. Files up to 500MB can be uploaded directly. Our CAD engine automatically extracts room dimensions and electrical layouts.'
  },
  {
    category: 'Technical',
    question: 'Is my data secure?',
    answer: 'Absolutely. We use bank-level encryption (AES-256) for all data transmission and storage. Our infrastructure is SOC 2 compliant and hosted on secure cloud servers. You own all your data and can export it anytime. We never share your data with third parties.'
  },
  {
    category: 'Technical',
    question: 'Can I access VibeLux from my phone?',
    answer: 'Yes! VibeLux is fully responsive and works on any device. We also offer native iOS and Android apps (coming Q2 2024) with offline support, push notifications, and camera integration for pest/disease identification.'
  },

  // Integration & Compliance
  {
    category: 'Integration',
    question: 'Does VibeLux integrate with METRC/BioTrack?',
    answer: 'Yes, we have full METRC and BioTrack integration for cannabis facilities. Harvest weights, waste, and transfers automatically sync. This saves hours of manual data entry and ensures compliance. We also support other state tracking systems.'
  },
  {
    category: 'Integration',
    question: 'Can I connect my climate control system?',
    answer: 'Yes! We integrate with all major climate control systems including Priva, Argus, Link4, Wadsworth, and others. You can monitor and control temperature, humidity, CO2, and ventilation directly from VibeLux. We support BACnet, Modbus, and proprietary protocols.'
  },
  {
    category: 'Integration',
    question: 'What about lighting control?',
    answer: 'VibeLux controls any 0-10V dimmable fixtures and integrates with smart LED systems. Features include sunrise/sunset simulation, DLI tracking, spectrum control, and zone management. We work with all major lighting brands.'
  },

  // Billing & Account
  {
    category: 'Billing',
    question: 'Can I change or cancel my plan anytime?',
    answer: 'Yes! You can upgrade, downgrade, or cancel your subscription anytime. There are no long-term contracts or cancellation fees. If you cancel, you\'ll retain access until the end of your billing period. Your data remains available for export for 30 days after cancellation.'
  },
  {
    category: 'Billing',
    question: 'Do you offer discounts for multiple facilities?',
    answer: 'Yes! We offer volume discounts starting at 3 facilities. Educational institutions and non-profits receive 20% off. Annual billing saves 15%. Contact our sales team for custom enterprise pricing for 10+ facilities.'
  },
  {
    category: 'Billing',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, ACH bank transfers, and wire transfers. For enterprise accounts, we can accommodate purchase orders and custom billing terms. All payments are processed securely through Stripe.'
  }
];

export function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(faqData.map(item => item.category)))];

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
          <HelpCircle className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-400">Support Center</span>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-gray-400">
          Find answers to common questions about VibeLux
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === category
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQ.map((item, index) => {
          const isExpanded = expandedItems.has(index);
          
          return (
            <div
              key={index}
              className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => toggleExpanded(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/80 transition-colors"
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-medium text-purple-400">{item.category}</span>
                  </div>
                  <h3 className="font-semibold text-white">{item.question}</h3>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`} />
              </button>
              
              {isExpanded && (
                <div className="px-6 pb-4">
                  <p className="text-gray-300 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredFAQ.length === 0 && (
        <div className="text-center py-12">
          <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No FAQs found matching your search.</p>
        </div>
      )}

      {/* Still need help? */}
      <div className="mt-12 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-8 text-center border border-purple-500/20">
        <h3 className="text-2xl font-bold text-white mb-2">Still have questions?</h3>
        <p className="text-gray-300 mb-6">
          Our support team is here to help you succeed
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/contact"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Contact Support
          </a>
          <a
            href="/docs"
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            View Documentation
          </a>
        </div>
      </div>
    </div>
  );
}