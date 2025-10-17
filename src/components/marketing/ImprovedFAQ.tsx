"use client"

import { useState } from 'react'
import { 
  ChevronDown, 
  Search, 
  Filter, 
  DollarSign, 
  Clock, 
  Zap, 
  Shield,
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  category: string
  outcome?: string // What the customer achieves
  timeframe?: string // How quickly they see results
  popular?: boolean
}

const improvedFAQData: FAQItem[] = [
  // Getting Started - Outcome Focused
  {
    category: 'Getting Started',
    question: 'How quickly will I see energy savings?',
    answer: 'Most facilities see a 15-20% reduction in their next electricity bill (within 30 days). Our AI needs just 24-48 hours to learn your facility patterns before optimization begins. You\'ll see real-time energy usage improvements immediately in your dashboard.',
    outcome: '15-20% savings in first month',
    timeframe: 'Next billing cycle',
    popular: true
  },
  {
    category: 'Getting Started',
    question: 'What does it actually cost me to get started?',
    answer: 'We offer a 14-day free trial with credit card required. After that, pricing starts at $29/month for our Design Solo plan. We also offer a unique Energy Savings Program where you pay $0 upfront and we share 25% of your verified energy savings. Most customers choose this because there\'s zero risk.',
    outcome: 'Either $0 upfront or $299/month',
    timeframe: 'Free for 14 days',
    popular: true
  },
  {
    category: 'Getting Started',
    question: 'Do I need to buy new equipment or sensors?',
    answer: 'No! VibeLux works with your existing lighting, sensors, and controllers. We support 100+ sensor brands and all major protocols. If you don\'t have sensors yet, we\'ll recommend budget-friendly options that pay for themselves in energy savings within 60 days.',
    outcome: 'Works with existing equipment',
    timeframe: 'No equipment purchases needed'
  },
  {
    category: 'Getting Started', 
    question: 'How long does setup actually take?',
    answer: 'The basic setup takes 5-10 minutes: upload your facility layout (or sketch it), select your crop type, and you\'ll get an AI-generated lighting design immediately. Connecting sensors for optimization takes another 10-20 minutes with our step-by-step guide. Most customers are fully operational within their first hour.',
    outcome: 'Fully operational within 1 hour',
    timeframe: 'Basic design in 5 minutes'
  },

  // ROI & Results - What customers really want to know
  {
    category: 'Results',
    question: 'How much money will I actually save?',
    answer: 'The average 10,000 sq ft facility saves $4,500/month ($54,000/year) through energy optimization, better yields, and reduced labor. Cannabis facilities typically save 30-40% on electricity and see 15-25% yield improvements. We guarantee at least 15% energy savings or the service is free until you hit that target.',
    outcome: '$54,000/year for average facility',
    timeframe: 'Savings start in 30 days',
    popular: true
  },
  {
    category: 'Results',
    question: 'What if I don\'t save enough to justify the cost?',
    answer: 'We offer a performance guarantee: if you don\'t achieve at least 15% energy cost reduction within 90 days, VibeLux is free until you do. We\'ve never had to honor this guarantee because our AI-powered optimization consistently delivers 20-40% savings. Plus, most customers break even on the subscription cost in their first month.',
    outcome: 'Target 15% energy savings',
    timeframe: '90-day guarantee period'
  },
  {
    category: 'Results',
    question: 'How much will my yields actually improve?',
    answer: 'Facilities typically see 15-25% yield improvements through better light uniformity and spectrum optimization. For cannabis, this means going from 1.2 lbs/sq ft to 1.4-1.5 lbs/sq ft. The improved uniformity also means more consistent quality across your entire harvest, reducing waste and increasing saleable product.',
    outcome: '15-25% yield increase typical',
    timeframe: 'Next harvest cycle'
  },

  // Technical - Focused on outcomes not features
  {
    category: 'Technical',
    question: 'Will this actually work with my specific setup?',
    answer: 'Yes. We support all major lighting brands (HPS, CMH, LED) and work with 60+ CAD file formats. Our system integrates with virtually any sensor or controller you have. We have customers running everything from small LED grows to massive HPS facilities to mixed lighting setups. If it grows plants, VibeLux can optimize it.',
    outcome: 'Works with any growing setup',
    timeframe: 'Compatible immediately'
  },
  {
    category: 'Technical',
    question: 'What happens if the system goes down?',
    answer: 'VibeLux runs in the cloud with high availability. If our servers go offline, your equipment continues running on its last settings - nothing breaks. We also provide monitoring and will alert you to any issues. Most customers never experience any downtime.',
    outcome: 'High availability cloud infrastructure',
    timeframe: 'Less than 8 hours downtime/year'
  },
  {
    category: 'Technical',
    question: 'Is my facility data secure and private?',
    answer: 'Absolutely. We use the same security standards as banks (AES-256 encryption). Your data is never shared with anyone - not competitors, not manufacturers, not regulators. You own all your data and can export it anytime. We\'re SOC 2 compliant and undergo regular security audits.',
    outcome: 'Bank-level security for your data',
    timeframe: 'Secure from day one'
  },

  // Process & Support
  {
    category: 'Support',
    question: 'What if I get stuck or need help?',
    answer: 'You get direct access to our team via live chat (Mon-Fri 9am-5pm EST) and email support with fast response times. Pro and Enterprise customers get a dedicated account manager. We also provide extensive video tutorials, documentation, and weekly group training sessions.',
    outcome: 'Direct access to expert support',
    timeframe: 'Fast response times'
  },
  {
    category: 'Support',
    question: 'Can you help with compliance and investor reports?',
    answer: 'Yes! VibeLux automatically generates professional compliance reports for most state requirements. We also create investor-ready documentation including ROI analysis, energy efficiency reports, and facility optimization summaries. Many customers use our reports to secure additional funding or satisfy investor requirements.',
    outcome: 'Professional compliance and investor reports',
    timeframe: 'Generated automatically'
  },

  // Advanced Features - For sophisticated users
  {
    category: 'Advanced',
    question: 'Can I integrate this with my existing facility management system?',
    answer: 'Yes. VibeLux has APIs that integrate with most facility management platforms, building automation systems, and custom software. We support MQTT, Modbus, BACnet, and REST APIs. Our team can help set up custom integrations for Enterprise customers.',
    outcome: 'Integrates with your existing systems',
    timeframe: 'Custom integrations available'
  },
  {
    category: 'Advanced',
    question: 'What about multi-facility operations?',
    answer: 'VibeLux is built for scale. You can manage unlimited facilities from one dashboard, compare performance across sites, and roll out optimizations company-wide. Enterprise customers get features like user permissions, custom branding, and dedicated infrastructure. Pricing scales efficiently with volume.',
    outcome: 'Unlimited facilities, one dashboard',
    timeframe: 'Multi-facility ready immediately'
  }
]

export function ImprovedFAQ() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0, 1])) // Auto-expand popular items

  const categories = ['All', 'Getting Started', 'Results', 'Technical', 'Support', 'Advanced']
  
  const filteredFAQ = improvedFAQData.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Results': return DollarSign
      case 'Getting Started': return Clock
      case 'Technical': return Zap
      case 'Support': return Users
      case 'Advanced': return Shield
      default: return CheckCircle
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-white mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Get straight answers about ROI, setup time, and what you can expect from VibeLux
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-12 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 text-white pl-12 pr-4 py-4 rounded-xl border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category)
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category}
              </button>
            )
          })}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQ.map((item, index) => {
          const isExpanded = expandedItems.has(index)
          const Icon = getCategoryIcon(item.category)
          
          return (
            <div 
              key={index} 
              className={`bg-gray-800/50 border rounded-xl overflow-hidden transition-all ${
                item.popular ? 'border-blue-500/50 bg-blue-900/20' : 'border-gray-700'
              } ${isExpanded ? 'shadow-lg' : 'hover:border-gray-600'}`}
            >
              <button
                onClick={() => toggleExpanded(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
                      {item.category}
                    </span>
                    {item.popular && (
                      <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-semibold">
                        Popular
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white leading-tight">
                    {item.question}
                  </h3>
                  {item.outcome && !isExpanded && (
                    <p className="text-sm text-green-400 mt-1">
                      ✓ {item.outcome}
                    </p>
                  )}
                </div>
                <ChevronDown 
                  className={`w-6 h-6 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-gray-700/50">
                  <div className="pt-4 space-y-4">
                    <p className="text-gray-300 leading-relaxed">
                      {item.answer}
                    </p>
                    
                    {(item.outcome || item.timeframe) && (
                      <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-700/50">
                        {item.outcome && (
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-medium">{item.outcome}</span>
                          </div>
                        )}
                        {item.timeframe && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400 font-medium">{item.timeframe}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* No results message */}
      {filteredFAQ.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-400 text-lg">No questions found matching your search.</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('All')
            }}
            className="mt-4 text-blue-400 hover:text-blue-300 underline"
          >
            Clear search and filters
          </button>
        </div>
      )}

      {/* CTA Section */}
      <div className="mt-16 text-center bg-gradient-to-r from-blue-900/30 to-green-900/30 border border-blue-500/30 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-white mb-4">
          Still have questions?
        </h3>
        <p className="text-gray-300 mb-6">
          Get personalized answers from our team of growing experts
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
            Schedule a Demo
            <ArrowRight className="w-4 h-4" />
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all">
            Live Chat Support
          </button>
        </div>
      </div>
    </div>
  )
}