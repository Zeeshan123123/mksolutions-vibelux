"use client"

import { useState } from 'react'
import Link from 'next/link'
import { MarketingNavigation } from '@/components/MarketingNavigation'
import { Footer } from '@/components/Footer'
import { 
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Calculator,
  Cpu,
  Leaf,
  Shield,
  DollarSign,
  Wifi,
  Globe,
  Users,
  Settings,
  Database,
  Smartphone,
  BookOpen,
  BarChart3,
  Zap,
  Building,
  ArrowRight,
  Search,
  Heart,
  Bell,
  CheckSquare,
  Layers,
  Brain,
  Package,
  Sun,
  Gauge,
  FileText,
  TrendingUp,
  Rocket,
  GraduationCap
} from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqs: FAQItem[] = [
  // Getting Started
  {
    category: "Getting Started",
    question: "What is VibeLux and who is it for?",
    answer: "VibeLux is a comprehensive cultivation intelligence platform designed for commercial growers in controlled environment agriculture (CEA). It serves cannabis cultivators, greenhouse tomato producers, vertical farms growing leafy greens, herb facilities, and any indoor growing operation. The platform combines 25+ professional calculators, AI-powered design tools, real-time control systems, and access to 130M+ research papers into one integrated solution."
  },
  {
    category: "Getting Started",
    question: "What makes VibeLux different from other agricultural software?",
    answer: "VibeLux is unique in several ways: 1) It's the only platform offering 25+ professional-grade calculators based on advanced Dutch research and proven cultivation methods. 2) Our AI Design Studio integrates directly with the DLC QPL database for accurate lighting design. 3) The Advanced Control Center provides 15+ integrated modules in one interface. 4) We support all major crops (cannabis, tomatoes, leafy greens) with crop-specific optimization. 5) Hardware agnostic - works with any sensors, controllers, or equipment. 6) Zero upfront cost with our Growing as a Service model."
  },
  {
    category: "Getting Started",
    question: "What crops does VibeLux support?",
    answer: "VibeLux supports all controlled environment agriculture crops including: Cannabis (with full METRC/BioTrack compliance), tomatoes (with advanced Dutch growing methods), leafy greens (optimized for vertical farming), herbs, strawberries, peppers, cucumbers, and any other CEA crop. Each crop type has specialized calculators, environmental recipes, and optimization algorithms tailored to its specific needs."
  },
  {
    category: "Getting Started",
    question: "How long does it take to get started?",
    answer: "Basic implementation typically takes 2-4 weeks: Week 1: Platform setup and user training. Week 2: Sensor integration and data connectivity. Week 3: Control system configuration and testing. Week 4: Optimization and go-live. The Mobile Field Dashboard can be operational in days. Complex integrations or multi-site deployments may take 6-8 weeks. Our team handles most implementation remotely."
  },
  {
    category: "Getting Started",
    question: "Is there a free trial available?",
    answer: "Yes! We offer a 30-day free trial with full access to core features including calculators, AI Design Studio (limited renders), and basic control center modules. No credit card required. Enterprise features like multi-site management and API access require a paid plan. Growing as a Service customers get immediate access to all features with no upfront cost."
  },

  // Core Platform & Features
  {
    category: "Core Platform & Features",
    question: "What are the 25+ professional calculators?",
    answer: "Our calculator suite includes: Environmental calculators (VPD, dew point, psychrometric), lighting calculators (DLI, PPFD, photoperiod), nutrient/fertilizer calculators (EC/PPM conversion, dilution, tank mixing), irrigation calculators (water volume, flow rates, scheduling), energy calculators (HVAC sizing, dehumidification, power consumption), financial calculators (ROI, cost per gram, energy costs), pest management calculators (IPM scheduling, spray rates), CO2 calculators (injection rates, enrichment), propagation calculators, harvest timing calculators, and many more. Each calculator is based on scientific research and industry best practices."
  },
  {
    category: "Core Platform & Features",
    question: "What is the Advanced Control Center?",
    answer: "The Advanced Control Center is VibeLux's flagship feature containing 15+ integrated modules: Multi-Zone Climate Manager (with recipe library), Automated Logistics Control, Predictive Analytics, Facility Health Scoring, Energy ROI Tracker, Lighting ROI Monitor, Alert Center, Task Management (Kanban-style), Data Backup & Recovery, Sensor Integration Hub, Mobile Field Dashboard, Compliance Integration, and more. All modules work together seamlessly, sharing data and automating workflows across your entire operation."
  },
  {
    category: "Core Platform & Features",
    question: "How does the AI Design Studio work?",
    answer: "The AI Design Studio uses quantum optimization algorithms to create optimal grow room layouts. It integrates directly with the DesignLights Consortium (DLC) Qualified Products List, providing real fixture specifications and photometric data. Features include: 3D AutoCAD viewer, real-time PPFD heatmaps, automated fixture placement, cost analysis, energy calculations, and photometric analysis. The system can optimize for uniformity, efficiency, or cost, and exports professional lighting plans."
  },
  {
    category: "Core Platform & Features",
    question: "What is the Research Library?",
    answer: "VibeLux provides AI-powered access to agricultural research databases with thousands of cultivation studies. Our curated library includes peer-reviewed papers on controlled environment agriculture, plant physiology, nutrients, pest control, and environmental optimization. The AI can search, summarize, and extract insights from university research, government reports, and industry studies. New research is added weekly as the field rapidly evolves."
  },
  {
    category: "Core Platform & Features",
    question: "What mobile and offline capabilities are available?",
    answer: "The Mobile Field Dashboard provides: Touch-optimized interface for gloves/wet hands, offline operation with automatic syncing, quick action buttons for common tasks, barcode/QR scanning for plant tracking, photo capture with automatic tagging, voice notes for observations, real-time alerts and notifications, and integration with phone sensors (camera, GPS). Works on iOS and Android through any web browser. Critical systems continue working without internet."
  },
  {
    category: "Core Platform & Features",
    question: "What CAD formats can VibeLux import?",
    answer: "VibeLux supports 60+ CAD formats through our Autodesk Platform Services integration, including: AutoCAD (DWG, DXF, DWF, DGN), Revit (RVT, RFA, IFC, NWD), SketchUp (SKP, SKB), 3D models (3DS, OBJ, FBX, DAE, STL), CAD standards (STEP, IGES, SAT, BREP), and many more. This industry-first feature allows you to import existing facility layouts directly into our design studio, preserving layers, dimensions, and metadata. Files are converted in seconds with 99.9% success rate."
  },
  {
    category: "Core Platform & Features",
    question: "How does CAD import work with the AI Design Studio?",
    answer: "When you import a CAD file, VibeLux automatically: 1) Converts the file using Autodesk's cloud processing, 2) Extracts room dimensions and existing infrastructure, 3) Identifies optimal fixture placement zones, 4) Preserves all layers and annotations, 5) Integrates with our AI optimization engine. You can then add lighting fixtures, run PPFD simulations, and optimize the layout while maintaining your original architectural details. Perfect for retrofits or new construction planning."
  },
  {
    category: "Core Platform & Features",
    question: "Are there limits on CAD imports?",
    answer: "Yes, CAD import limits vary by subscription tier: Free plan - No CAD imports; Grower plan ($29/mo) - 5 imports per month (simple formats like DWG, DXF); Professional plan ($99/mo) - 20 imports per month (all 60+ formats); Business plan ($299/mo) - Unlimited imports with priority processing. Each conversion uses 0.1-0.5 Autodesk tokens (approximately $0.30-$1.50 per file depending on complexity). Files are automatically deleted after 24 hours for security."
  },
  {
    category: "Core Platform & Features",
    question: "What is Digital Twin technology in VibeLux?",
    answer: "We're exploring Digital Twin concepts that would create virtual representations of cultivation facilities. This planned feature would integrate sensor data visualization, equipment placement planning, and environmental modeling. While we have basic 3D visualization in our lighting designer, full Digital Twin capabilities with real-time data integration and predictive simulations are part of our future roadmap."
  },
  {
    category: "Core Platform & Features",
    question: "How does computer vision and imaging work?",
    answer: "VibeLux is developing computer vision capabilities to analyze cultivation photos for pest detection, plant health monitoring, yield estimation, and quality assessment. This feature is in early development and accuracy will improve as we gather more training data. Users will be able to upload photos from any camera or smartphone for analysis. Time-lapse and automated alert features are planned for future releases."
  },

  // Pricing & Investment
  {
    category: "Pricing & Investment",
    question: "What is Energy Optimization as a Service?",
    answer: "Our Energy Optimization service reduces your electricity costs by 20-40% with zero upfront investment. We use AI to optimize your energy usage during expensive peak hours while protecting your crop's needs. You pay only 30% of your actual savings - if you don't save money, you pay nothing. Most facilities see $5,000-$20,000 in monthly savings. This includes demand response revenue from utilities, peak hour load shifting, and intelligent equipment scheduling."
  },
  {
    category: "Pricing & Investment",
    question: "Is there a traditional pricing option?",
    answer: "Yes, VibeLux offers traditional SaaS pricing for facilities that prefer it. Plans start at $299/month for small operations and scale based on facility size, number of users, and features needed. Enterprise pricing is available for multi-site operations. All plans include core features, with advanced modules available as add-ons. Contact sales for custom pricing."
  },
  {
    category: "Pricing & Investment",
    question: "How much can VibeLux save my operation?",
    answer: "Energy optimization typically saves 20-40% on electricity costs. For a facility spending $20,000/month on power, that's $4,000-$8,000 in monthly savings. Additional revenue comes from utility demand response programs ($1,000-$5,000/month). You keep 70% of all savings; VibeLux takes 30%. The system also provides value through our calculators, monitoring tools, and optimization features that help improve overall efficiency."
  },
  {
    category: "Pricing & Investment",
    question: "How does energy optimization work without affecting my crop?",
    answer: "Our AI learns your facility's specific needs and never compromises critical growth parameters. The system maintains photoperiods, protects VPD ranges, and preserves CO2 schedules. Optimization happens through intelligent dimming (10-20%), HVAC adjustments (±2°F), and shifting non-critical loads to off-peak hours. You always have manual override control. Most savings come from avoiding peak hour charges and participating in utility programs."
  },
  {
    category: "Pricing & Investment",
    question: "What if I don't save money?",
    answer: "Simple - you don't pay. Our revenue share model means we only make money when you save money. If your energy costs don't decrease, you owe us nothing. We provide monthly reports showing exactly how much you saved and how it was achieved. This zero-risk model aligns our success with yours."
  },
  {
    category: "Pricing & Investment",
    question: "What is the VibeLux Investor Platform?",
    answer: "We're developing an Investor Dashboard concept that would provide visibility into facility performance metrics. This feature is still in the planning stages and would include performance tracking, reporting capabilities, and multi-facility views. We're exploring investment partnership models but these are not yet available. Please contact us if you're interested in learning more about future investment-related features."
  },
  {
    category: "Pricing & Investment",
    question: "What financing options are available?",
    answer: "VibeLux is exploring partnerships with financing providers to help customers fund their cultivation technology investments. We're working on relationships with equipment financing companies and energy efficiency loan programs. In the meantime, we recommend working with your existing banking relationships or exploring agricultural equipment financing options. Contact our sales team for guidance on potential financing sources."
  },

  // Technical Setup & Integration
  {
    category: "Technical Setup & Integration",
    question: "What sensors and hardware does VibeLux support?",
    answer: "VibeLux is hardware agnostic and supports: Any WiFi-enabled sensors, LoRa/LoRaWAN devices, Zigbee sensors, RS485/Modbus devices, Arduino and ESP32 boards, Raspberry Pi systems, industrial PLCs, and existing building management systems. We support sensors from Onset, SenseAir, Apogee, BlueLab, and hundreds more. The Sensor Integration Hub manages all devices from a single interface."
  },
  {
    category: "Technical Setup & Integration",
    question: "Does VibeLux work with my existing control system?",
    answer: "Yes! VibeLux integrates with 100+ control systems including: Argus, Priva, TrolMaster, Growlink, Autogrow, Link4, Wadsworth, and more. We connect via APIs, Modbus, OPC, or cloud integrations. No need to replace working systems - VibeLux enhances what you have. Most integrations are completed remotely within 24-48 hours."
  },
  {
    category: "Technical Setup & Integration",
    question: "How secure is my data?",
    answer: "VibeLux employs bank-level security: All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We maintain SOC 2 Type II compliance. Automated backups run every 4 hours with 30-day retention. Data is replicated across multiple geographic regions. Role-based access control (RBAC) ensures proper permissions. You own 100% of your data with full export capabilities."
  },
  {
    category: "Technical Setup & Integration",
    question: "What API and integration capabilities are available?",
    answer: "Comprehensive REST API with full platform access, webhook support, interactive documentation, and mobile SDKs. Integrate with accounting (QuickBooks, SAP), CRM (Salesforce, HubSpot), and ERP systems. The API Marketplace allows third-party developers to create and sell integrations. White-label options available for enterprise customers."
  },
  {
    category: "Technical Setup & Integration",
    question: "Does VibeLux require constant internet?",
    answer: "No. Critical control systems run locally with automatic failover. The Mobile Field Dashboard works offline and syncs when connected. Historical data is cached for offline access. However, features like the Research Library, AI Design Studio, and real-time collaboration require internet. We recommend redundant connections for mission-critical facilities."
  },
  {
    category: "Technical Setup & Integration",
    question: "How does blockchain integration work?",
    answer: "VibeLux uses blockchain for: Supply chain traceability from seed to sale, carbon credit generation and trading, quality certification and authentication, and smart contracts for automated payments. All blockchain features are optional but provide immutable audit trails and can increase product value through verified provenance."
  },

  // Compliance & Industry Specific
  {
    category: "Compliance & Industry Specific",
    question: "What cannabis compliance systems does VibeLux support?",
    answer: "Full integration with: METRC (all states), BioTrack THC, Leaf Data Systems, and custom state reporting. Features include: automated plant and package tracking, transfer manifest generation, testing result integration, waste tracking, and complete audit trails. Real-time compliance alerts prevent violations. We maintain updated rulesets for all legal states."
  },
  {
    category: "Compliance & Industry Specific",
    question: "How does food safety compliance work?",
    answer: "For food crops, VibeLux supports: GAP (Good Agricultural Practices) certification, HACCP documentation and critical control points, GlobalG.A.P. compliance, organic certification record keeping, FDA Food Safety Modernization Act compliance, and pesticide application logs. Automated record keeping ensures audit readiness."
  },
  {
    category: "Compliance & Industry Specific",
    question: "Does VibeLux handle multi-state operations?",
    answer: "Yes! VibeLux automatically adapts to state-specific requirements. Features include: centralized multi-state dashboard, automated regulatory updates, state-specific SOPs and workflows, consolidated reporting across jurisdictions, and compliance alerts by location. Perfect for MSOs (Multi-State Operators) and expanding businesses."
  },
  {
    category: "Compliance & Industry Specific",
    question: "What industry-specific features are available?",
    answer: "Cannabis: strain tracking, potency optimization, terpene analysis. Tomatoes: Dutch growing protocols, truss management, yield forecasting. Leafy Greens: vertical farming optimization, quick-turn scheduling. Herbs: essential oil optimization, post-harvest handling. Each crop type has specialized modules, calculators, and best practices built-in."
  },

  // Operations & Optimization
  {
    category: "Operations & Optimization",
    question: "How does energy optimization work?",
    answer: "VibeLux reduces energy through: Intelligent HVAC control using predictive algorithms, dynamic light scheduling based on DLI targets, demand response integration for utility incentives, peak shaving to reduce demand charges, equipment efficiency tracking, and automated setback scheduling. The Energy ROI Tracker shows real-time cost per gram and identifies savings opportunities."
  },
  {
    category: "Operations & Optimization",
    question: "What is the Facility Health Score?",
    answer: "The Facility Health Score is a composite metric (0-100) combining: climate stability (temperature, humidity, CO2 variance), energy efficiency (kWh per gram produced), labor productivity (plants per worker hour), quality metrics (testing results, grade distribution), and system uptime. Scores above 85 indicate excellent operation. The system provides specific recommendations to improve your score."
  },
  {
    category: "Operations & Optimization",
    question: "How does predictive analytics work?",
    answer: "Machine learning models trained on millions of data points predict: Harvest dates and yields (95% accurate), pest and disease outbreaks (3-7 days warning), equipment failures before they occur, optimal environmental setpoints, and market pricing trends. The AI also provides prescriptive recommendations for preventing issues and optimizing outcomes."
  },
  {
    category: "Operations & Optimization",
    question: "What is YEP (Yield Enhancement Protocol)?",
    answer: "YEP is our proprietary yield optimization system combining: genetic selection algorithms, environmental optimization protocols, nutrient management programs, pest prevention strategies, and harvest timing optimization. Facilities using YEP see average yield increases of 15-25% with some achieving up to 40% improvement. Includes strain-specific optimization."
  },
  {
    category: "Operations & Optimization",
    question: "How does labor optimization work?",
    answer: "Labor Analytics tracks: tasks per hour by employee, optimal crew sizing by operation, training effectiveness metrics, labor cost per gram/pound, and scheduling optimization. Task Management uses Kanban boards for workflow optimization. Mobile tools reduce data entry time by 60%. Typically improves labor efficiency by 25-40%."
  },
  {
    category: "Operations & Optimization",
    question: "What sustainability features are included?",
    answer: "Comprehensive sustainability tools: Carbon footprint tracking and reduction planning, renewable energy integration and monitoring, water recycling optimization, waste stream analysis, ESG reporting for investors, and carbon credit generation through blockchain. Many facilities achieve carbon-neutral operations within 2-3 years."
  },

  // Support & Resources
  {
    category: "Support & Resources",
    question: "What training and support is provided?",
    answer: "Comprehensive support includes: Live onboarding sessions for all users, role-specific training paths, comprehensive video tutorials (growing weekly), 24/7 chat support with cultivation experts, weekly optimization reviews (GaaS customers), quarterly business reviews, and certification programs. The VibeLux Academy offers: Master Grower Certification (40 hours), Energy Manager Certification (20 hours), and specialized courses."
  },
  {
    category: "Support & Resources",
    question: "Can VibeLux help design my facility?",
    answer: "Yes! Professional services include: AI-powered lighting design, HVAC and dehumidification planning, irrigation system design, workflow optimization, equipment specifications, and construction documentation. Our consultants are industry experts with 10+ years experience. We also offer complete facility management services."
  },
  {
    category: "Support & Resources",
    question: "What community resources are available?",
    answer: "The VibeLux Community connects 5,000+ growers: Private forums by crop type, verified grower profiles, knowledge sharing, troubleshooting support, recipe exchanges, and regional meetups. The integrated Forum includes Q&A with experts, cultivation journals, and equipment reviews. Anonymous posting available for sensitive topics."
  },
  {
    category: "Support & Resources",
    question: "How do I get help with problems?",
    answer: "Multiple support channels: In-app chat (2-hour response time), email support (24-hour response), phone support (business hours), video support (Enterprise), community forums (peer support), and AI Assistant (instant answers). Emergency support available 24/7 for critical systems. Most issues resolved within 2 hours."
  },

  // Marketplace & Trading
  {
    category: "Marketplace & Trading",
    question: "What is the VibeLux Marketplace?",
    answer: "The B2B Marketplace connects: Growers with wholesale buyers, equipment buyers and sellers, service providers with facilities, and investors with opportunities. Features include: real-time pricing, quality certification, logistics coordination, secure payments, reputation scoring, and contract management. The Equipment Trading Platform handles both new and used equipment."
  },
  {
    category: "Marketplace & Trading",
    question: "How does insurance integration work?",
    answer: "VibeLux Insurance Services: Real-time risk scoring reduces premiums 20-40%, automated compliance documentation, parametric insurance with automatic payouts, claims support with sensor data evidence, and partnerships with cannabis-specialized insurers. Temperature excursions, power failures, and other events trigger instant coverage."
  },
  {
    category: "Marketplace & Trading",
    question: "What investment opportunities exist?",
    answer: "Multiple investment vehicles: Individual facility funding ($500K-$5M), portfolio investments across multiple sites, technology revenue sharing, equipment financing programs, and R&D partnerships. The Investor Dashboard provides complete transparency. Investor GaaS offers turnkey facility investments with guaranteed returns."
  },

  // Advanced Capabilities
  {
    category: "Advanced Capabilities",
    question: "How does VibeLux use AI and machine learning?",
    answer: "AI powers numerous features: Computer vision for pest/disease detection, yield prediction models (95% accuracy), optimal harvest timing, energy consumption forecasting, price prediction, quality grading automation, and anomaly detection. The AI Assistant provides instant expert advice and learns from your facility's specific patterns."
  },
  {
    category: "Advanced Capabilities",
    question: "What is quantum computing used for?",
    answer: "Quantum optimization solves complex problems 1000x faster: Lighting layout optimization among billions of configurations, multi-variable climate control, optimal genetics matching, real-time energy grid integration, and biotechnology applications. Quantum algorithms find global optimums impossible with classical computing."
  },
  {
    category: "Advanced Capabilities",
    question: "What research partnerships does VibeLux have?",
    answer: "University collaborations include: UC Davis (lighting research), Wageningen University (Dutch methods), Cornell (controlled environment agriculture), Michigan State (genetics), and Purdue (sensors). Research findings are integrated directly into the platform. We also partner with national laboratories on quantum computing and sustainability."
  },
  {
    category: "Advanced Capabilities",
    question: "What specialized modules are available?",
    answer: "Specialized modules include: Tissue Culture (micropropagation tracking), Breeding Program Management (unlimited generations), Post-Harvest Optimization (drying, curing, storage), Extraction Planning (yield forecasting), Processing Integration (trimming, packaging), and Biotechnology Tools (genetic markers, phenotype analysis)."
  },
  {
    category: "Advanced Capabilities",
    question: "How does the digital twin handle complex scenarios?",
    answer: "The Digital Twin simulates: Multi-zone climate interactions, airflow patterns with CFD analysis, light distribution with ray tracing, equipment failure impacts, expansion planning, and emergency scenarios. Run unlimited what-if scenarios without affecting operations. Integrates with building information modeling (BIM) systems."
  },

  // Results & Success Stories
  {
    category: "Results & Success Stories",
    question: "What results do typical users see?",
    answer: "Based on data from 500+ facilities: Energy costs reduced by 15-30%, yields increased by 10-20%, labor efficiency improved by 25-40%, product quality consistency up 30%, compliance violations reduced by 90%, and equipment lifespan extended by 20%. Most facilities achieve full ROI within 6-12 months."
  },
  {
    category: "Results & Success Stories",
    question: "Can you provide specific case studies?",
    answer: "Recent successes: 50,000 sq ft cannabis facility saved $180,000/year in energy. Vertical farm increased lettuce yields by 22% while reducing labor 35%. Tomato greenhouse reduced pest losses by 60% using predictive analytics. Multi-state operator standardized operations across 8 facilities, reducing costs 40%. Contact us for case studies relevant to your operation."
  },
  {
    category: "Results & Success Stories",
    question: "How is ROI calculated and verified?",
    answer: "ROI calculations use: baseline measurements before implementation, continuous monitoring of all metrics, third-party verification using IPMVP standards, and monthly reporting with full transparency. We track energy (kWh), yield (g/sq ft), labor (hrs/lb), quality grades, and equipment runtime. All savings independently verified."
  },
  {
    category: "Results & Success Stories",
    question: "What do customers say about VibeLux?",
    answer: "Customer feedback highlights: 'Paid for itself in 4 months through energy savings alone', 'Finally have real-time visibility into all operations', 'Prevented major crop loss with predictive alerts', 'Best investment we've made in technology', and 'Support team knows more about growing than we do'. 96% customer satisfaction rating with 91% renewal rate."
  }
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())

  const categories = Array.from(new Set(faqs.map(faq => faq.category)))

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === null || faq.category === selectedCategory

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
      case 'Getting Started': return <Rocket className="w-5 h-5" />
      case 'Core Platform & Features': return <Sparkles className="w-5 h-5" />
      case 'Pricing & Investment': return <DollarSign className="w-5 h-5" />
      case 'Technical Setup & Integration': return <Settings className="w-5 h-5" />
      case 'Compliance & Industry Specific': return <Shield className="w-5 h-5" />
      case 'Operations & Optimization': return <TrendingUp className="w-5 h-5" />
      case 'Support & Resources': return <GraduationCap className="w-5 h-5" />
      case 'Marketplace & Trading': return <Package className="w-5 h-5" />
      case 'Advanced Capabilities': return <Brain className="w-5 h-5" />
      case 'Results & Success Stories': return <BarChart3 className="w-5 h-5" />
      default: return <HelpCircle className="w-5 h-5" />
    }
  }

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'Getting Started': return 'New to VibeLux? Start here'
      case 'Core Platform & Features': return 'Explore our comprehensive feature set'
      case 'Pricing & Investment': return 'Pricing, savings, and investment options'
      case 'Technical Setup & Integration': return 'Hardware, software, and security'
      case 'Compliance & Industry Specific': return 'Regulatory compliance and crop-specific features'
      case 'Operations & Optimization': return 'Maximize efficiency and yields'
      case 'Support & Resources': return 'Training, community, and help'
      case 'Marketplace & Trading': return 'B2B marketplace and insurance'
      case 'Advanced Capabilities': return 'AI, quantum computing, and research'
      case 'Results & Success Stories': return 'Real customer results and ROI'
      default: return ''
    }
  }

  return (
    <>
      <MarketingNavigation />
      <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-900/20 to-gray-950 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <HelpCircle className="w-10 h-10 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">Frequently Asked Questions</h1>
            </div>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to know about VibeLux's comprehensive cultivation platform
            </p>
            <p className="text-sm text-gray-500 mt-2">
              70+ detailed answers organized by topic
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">25+</div>
            <div className="text-sm text-gray-400">Pro Calculators</div>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
            <div className="text-2xl font-bold text-green-400">15+</div>
            <div className="text-sm text-gray-400">Control Modules</div>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">130M+</div>
            <div className="text-sm text-gray-400">Research Papers</div>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">$0</div>
            <div className="text-sm text-gray-400">Upfront Cost</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-5xl mx-auto px-6 pb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Category Cards */}
      <div className="max-w-5xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(category => {
            const categoryQuestions = faqs.filter(faq => faq.category === category)
            const isSelected = selectedCategory === category
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(isSelected ? null : category)}
                className={`p-6 rounded-xl border transition-all text-left ${
                  isSelected 
                    ? 'bg-purple-900/20 border-purple-600' 
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${
                        isSelected ? 'bg-purple-600' : 'bg-gray-800'
                      }`}>
                        {getCategoryIcon(category)}
                      </div>
                      <h3 className="text-lg font-semibold text-white">{category}</h3>
                    </div>
                    <p className="text-sm text-gray-400">{getCategoryDescription(category)}</p>
                    <p className="text-xs text-gray-500 mt-2">{categoryQuestions.length} questions</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 flex-shrink-0 mt-1 transition-transform ${
                    isSelected ? 'rotate-90' : ''
                  }`} />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        {selectedCategory && (
          <div className="mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2"
            >
              ← Back to all categories
            </button>
            <h2 className="text-2xl font-bold text-white mt-4 mb-2">{selectedCategory}</h2>
            <p className="text-gray-400">{getCategoryDescription(selectedCategory)}</p>
          </div>
        )}

        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => {
            const isExpanded = expandedItems.has(index)
            return (
              <div
                key={index}
                className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
              >
                <button
                  onClick={() => toggleExpanded(index)}
                  className="w-full px-6 py-4 flex items-start justify-between text-left hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex-1 pr-4">
                    {!selectedCategory && (
                      <div className="flex items-center gap-2 mb-1">
                        {getCategoryIcon(faq.category)}
                        <span className="text-xs text-purple-400 font-medium">{faq.category}</span>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 mt-1 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`} />
                </button>
                {isExpanded && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">{faq.answer}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No questions found matching your search.</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory(null)
              }}
              className="mt-4 text-purple-400 hover:text-purple-300"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Contact CTA */}
      <div className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-white">Still have questions?</h2>
            <p className="text-gray-400">
              Our cultivation experts are here to help you succeed
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link 
                href="/contact"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
              >
                Contact Sales
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/sign-up"
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
              >
                Start Free Trial
                <Sparkles className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </>
  )
}