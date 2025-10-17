'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import { 
  Layers,
  Monitor,
  BarChart3,
  Calculator,
  DollarSign,
  Activity,
  Lightbulb,
  Thermometer,
  Droplets,
  Leaf,
  Brain,
  Battery,
  Users,
  Shield,
  Globe,
  Smartphone,
  ArrowRight,
  Check,
  Zap,
  ShoppingCart,
  Bot,
  FileText,
  Database,
  Map,
  GitBranch,
  Sun,
  FlaskConical,
  Package,
  Wrench,
  Share2,
  BookOpen,
  Grid3x3,
  Target,
  Cpu,
  Camera,
  Building,
  Sparkles,
  Scale,
  Atom,
  Dna,
  Gauge,
  Truck
} from 'lucide-react';

const featureCategories = [
  {
    title: 'Complete Facility Lifecycle Management',
    description: 'From concept to harvest - the only platform covering design, construction, and operations',
    icon: Building,
    color: 'from-blue-500 to-purple-600',
    badge: 'COMPLETE',
    features: [
      {
        name: 'AI-Powered Facility Design',
        description: 'Revolutionary AI assistant creates complete facility layouts from natural language',
        href: '/design/advanced',
        highlights: ['Conversational design interface', '3D greenhouse modeling', 'Multi-zone climate control', 'Professional CAD integration']
      },
      {
        name: 'Construction Project Management',
        description: 'Complete project tracking with milestones, team collaboration, and progress reporting',
        href: '/designer/projects',
        highlights: ['Project timeline tracking', 'Team collaboration tools', 'Milestone management', 'Progress reporting & analytics']
      },
      {
        name: 'Smart Greenhouse Setup Wizard',
        description: 'Automated facility setup with DLC fixture integration and step-by-step guidance',
        href: '/design',
        highlights: ['DLC fixture database (2000+ fixtures)', 'Automated layout generation', 'Professional IES file support', 'Custom fixture uploads']
      },
      {
        name: 'Multi-Facility Enterprise Management',
        description: 'Centralized operations management across multiple facilities and growing sites',
        href: '/dashboard',
        highlights: ['Multi-site monitoring', 'Centralized analytics', 'Team management', 'Performance benchmarking']
      }
    ]
  },
  {
    title: 'Professional Photometric & Lighting Tools',
    description: 'Industry-leading lighting design with real IES photometric data support',
    icon: Sun,
    color: 'from-yellow-500 to-orange-600',
    badge: 'PROFESSIONAL',
    features: [
      {
        name: 'IES File Integration',
        description: 'Upload and analyze real photometric data from any fixture manufacturer',
        href: '/fixtures',
        highlights: ['IESNA LM-63 format support', 'Real measured light distribution', 'Bilinear interpolation accuracy', 'Professional validation tools']
      },
      {
        name: 'Advanced Photometric Analysis',
        description: 'Comprehensive light distribution analysis with beam patterns and uniformity metrics',
        href: '/design/advanced',
        highlights: ['Peak intensity analysis', 'Beam & field angle detection', 'Uniformity calculations', 'Side light spillage modeling']
      },
      {
        name: 'DLC Certified Fixture Database',
        description: 'Complete integration with 2000+ DLC-qualified horticultural fixtures',
        href: '/fixtures',
        highlights: ['2000+ certified fixtures', 'Real PPF & efficacy data', 'Spectrum analysis', 'Automated recommendations']
      },
      {
        name: 'Custom Fixture Upload',
        description: 'Upload and validate custom IES files for any fixture not in our database',
        href: '/fixtures',
        highlights: ['Custom IES validation', 'Compatibility checking', 'Performance analysis', 'Integration workflows']
      }
    ]
  },
  {
    title: 'Advanced Dutch Research Cultivation',
    description: 'Professional cultivation protocols based on proven Dutch greenhouse research',
    icon: Leaf,
    color: 'from-green-500 to-emerald-600',
    badge: 'RESEARCH',
    features: [
      {
        name: 'Plant Physiological Monitor',
        description: 'Complete tomato plant health monitoring with VeGe balance analysis and exhaustion detection',
        href: '/calculators/environmental',
        highlights: ['Head width monitoring (6-9.5mm target)', 'VeGe balance analysis', 'Exhaustion detection', 'Fruit size tracking']
      },
      {
        name: 'Tomato IPM Dashboard',
        description: 'Integrated pest management with Advanced Dutch Research thresholds and protocols',
        href: '/calculators/environmental',
        highlights: ['Zero tolerance for mites', 'Whitefly: 10/card/week threshold', 'Thrips: 6/card/week threshold', 'Nursery quality control']
      },
      {
        name: 'Advanced VPD Calculator',
        description: 'Humidity deficit calculations with tomato pollination success analysis',
        href: '/calculators/environmental',
        highlights: ['5 g/m³ HD target', 'Pollination success probability', 'Critical temperature alerts', 'Real-time optimization']
      },
      {
        name: 'P-Band Climate Control',
        description: 'Advanced temperature control with momentum prevention for tomato crops',
        href: '/calculators/environmental',
        highlights: ['Light-based temperature targets', 'Momentum risk assessment', 'Semi-closed greenhouse optimization', '8-9 air exchanges/hour']
      },
      {
        name: 'Tomato Nutrient Calculator',
        description: 'Complete nutrient analysis for drip and drain water with Dutch research targets',
        href: '/calculators/water',
        highlights: ['K: 6.0-8.4 drip target', 'NO3: 10.8-24 drip range', 'Real-time element status', 'Automated recommendations']
      },
      {
        name: 'Light-Based Irrigation',
        description: 'DLI-driven irrigation with drain percentage optimization for tomato production',
        href: '/calculators/environmental',
        highlights: ['DLI-based drain %', 'Growth stage specific', 'Water use efficiency', 'Yield optimization']
      }
    ]
  },
  {
    title: 'Aquaculture & Aquaponics Systems',
    description: 'Design and manage recirculating aquaculture (RAS) and aquaponics facilities',
    icon: Droplets,
    color: 'from-blue-500 to-cyan-500',
    badge: 'NEW',
    features: [
      {
        name: 'RAS System Design',
        description: 'Design complete recirculating aquaculture systems with tank sizing and flow calculations',
        href: '/design/aquaculture',
        highlights: ['Multi-tank configurations', 'Biofilter sizing', 'Flow rate optimization', 'Piping schematics']
      },
      {
        name: 'Water Treatment Design',
        description: 'Calculate and design drum filters, biofilters, degassing, and oxygenation systems',
        href: '/calculators/aquaculture',
        highlights: ['Solids removal sizing', 'Nitrification calculations', 'CO2 degassing design', 'Oxygen injection sizing']
      },
      {
        name: 'Aquaponics Integration',
        description: 'Balance fish production with hydroponic plant cultivation for zero-waste systems',
        href: '/design/aquaponics',
        highlights: ['Fish-to-plant ratios', 'Nutrient balance modeling', 'pH management', 'System cycling guidance']
      },
      {
        name: 'Species-Specific Protocols',
        description: 'Optimized system parameters for tilapia, salmon, shrimp, and other species',
        href: '/cultivation/aquaculture',
        highlights: ['Temperature requirements', 'Stocking densities', 'Feed conversion ratios', 'Water quality targets']
      },
      {
        name: 'Monitoring & Automation',
        description: 'Real-time water quality monitoring with automated control systems',
        href: '/monitoring/aquaculture',
        highlights: ['NH3/NO2/NO3 tracking', 'DO level control', 'pH automation', 'Feed scheduling']
      },
      {
        name: 'Circular Economy Tools',
        description: 'Integrate waste-to-energy, nutrient recovery, and circular production systems',
        href: '/calculators/circular-economy',
        highlights: ['Biogas calculations', 'Nutrient mass balance', 'Energy recovery modeling', 'Zero-waste planning']
      }
    ]
  },
  {
    title: 'Insurance & Risk Management',
    description: 'Framework for insurance integration and risk monitoring',
    icon: Shield,
    color: 'from-gray-500 to-gray-600',
    badge: 'FRAMEWORK',
    features: [
      {
        name: 'Risk Assessment Framework',
        description: 'Monitor facility conditions and assess risk factors',
        href: '/monitoring',
        highlights: ['Environmental monitoring', 'Equipment status tracking', 'Alert system', 'Risk reporting']
      },
      {
        name: 'Insurance Integration Ready',
        description: 'Prepared for future insurance marketplace integration',
        href: '/pricing',
        highlights: ['Data collection framework', 'Monitoring infrastructure', 'Reporting capabilities', 'Partnership ready']
      },
      {
        name: 'Compliance Monitoring',
        description: 'Track compliance metrics and generate reports',
        href: '/control-center',
        highlights: ['Automated logging', 'Compliance reports', 'Audit trails', 'Documentation']
      }
    ]
  },
  {
    title: 'Complete Operational Management',
    description: 'Everything you need to run daily operations, not just monitor them',
    icon: Gauge,
    color: 'from-green-500 to-emerald-600',
    badge: 'NEW',
    features: [
      {
        name: 'Daily Operations Hub',
        description: 'Complete shift management, harvest tracking, and task workflows',
        href: '/operations/daily',
        highlights: ['Shift handoffs & notes', 'Harvest planning & tracking', 'Task assignment & workflows', 'Real-time dashboard']
      },
      {
        name: 'Smart Inventory Management',
        description: 'Track supplies, nutrients, and equipment with automated reordering',
        href: '/operations/inventory',
        highlights: ['Batch & lot tracking', 'Automated reorder points', 'Expiry management', 'Consumption analytics']
      },
      {
        name: 'Customer Order Management',
        description: 'Complete order-to-cash workflow with QuickBooks/Xero integration',
        href: '/operations/orders',
        highlights: ['Customer profiles', 'QuickBooks/Xero sync', 'Automated invoicing', 'Payment tracking']
      },
      {
        name: 'Compliance Workflow Engine',
        description: 'GMP compliance with 21 CFR Part 11 validation and automated document processing',
        href: '/operations/compliance',
        highlights: ['GMP/21 CFR Part 11 compliance', 'OCR document processing', 'Automated workflows', 'Audit trail generation']
      },
      {
        name: 'Vendor Management System',
        description: 'Track vendor performance and optimize your supply chain',
        href: '/operations/vendors',
        highlights: ['Performance scorecards', 'Contract management', 'Purchase order tracking', 'Vendor analytics']
      },
      {
        name: 'Knowledge Base & SOPs',
        description: 'Centralized repository for procedures, training, and best practices',
        href: '/operations/knowledge',
        highlights: ['SOP version control', 'Training records', 'Interactive content', 'Certification tracking']
      }
    ]
  },
  {
    title: 'AI & Machine Learning',
    description: 'Hybrid ML architecture with instant feedback + platform intelligence for competitive advantage',
    icon: Bot,
    color: 'from-purple-500 to-purple-600',
    badge: 'ENHANCED',
    features: [
      {
        name: 'Hybrid ML Architecture',
        description: 'Revolutionary dual-processing: instant client-side feedback + detailed server-side platform intelligence',
        href: '/design/advanced',
        highlights: ['Instant user feedback (<100ms)', 'Cross-facility benchmarking', 'Platform learning advantage', 'Best-in-class UX + analytics']
      },
      {
        name: 'Predictive Analytics Suite',
        description: 'Six ML models for yield, energy, pest risk, harvest timing, environmental, and crop quality prediction',
        href: '/api/ml/predict',
        highlights: ['Hybrid processing (client + server)', 'Real-time plant health scoring', 'Energy optimization insights', 'Disease detection with instant preview']
      },
      {
        name: 'AI Plant Health Diagnosis',
        description: 'Upload photos for instant AI-powered plant health analysis with mobile scouting app',
        href: '/scouting',
        highlights: ['Instant client-side preview', 'Detailed server analysis', 'Mobile field collection', 'Platform intelligence learning']
      }
    ]
  },
  {
    title: 'Professional CAD Integration',
    description: 'Import and work with industry-standard CAD files powered by Autodesk Platform Services',
    icon: FileText,
    color: 'from-teal-500 to-teal-600',
    badge: 'NEW',
    features: [
      {
        name: '60+ CAD Format Support',
        description: 'Import DWG, Revit, IFC, SketchUp, and 60+ other professional CAD formats',
        href: '/design/advanced',
        highlights: ['AutoCAD DWG/DXF', 'Revit RVT/RFA', 'IFC BIM models', 'Automatic conversion']
      },
      {
        name: 'Multi-Model Coordination',
        description: 'Load architectural, MEP, and structural models together for clash detection',
        href: '/design/advanced',
        highlights: ['Clash detection', 'Layer management', 'Model comparison', 'Version control']
      },
      {
        name: 'BIM Workflow Integration',
        description: 'Extract room dimensions, electrical systems, and materials from BIM models',
        href: '/design/advanced',
        highlights: ['Auto room detection', 'Electrical data extraction', 'Material properties', 'Space analysis']
      }
    ]
  },
  {
    title: 'Advanced 3D Visualization',
    description: 'Stunning photorealistic 3D views with real-time analysis',
    icon: Layers,
    color: 'from-blue-500 to-blue-600',
    badge: 'ENHANCED',
    features: [
      {
        name: '3D Design Studio with CAD Import',
        description: 'Professional 3D lighting design with Autodesk CAD integration and real-time PPFD calculations',
        href: '/design/advanced',
        highlights: ['60+ CAD formats (DWG, Revit, IFC)', 'Photorealistic rendering', 'PPFD heat maps', 'Multi-model coordination']
      },
      {
        name: 'PPFD Heat Maps',
        description: 'Interactive 3D heat maps showing light intensity distribution',
        href: '/calculators',
        highlights: ['Real-time calculations', 'Multi-layer analysis', 'Uniformity metrics', 'Export to reports']
      },
      {
        name: 'Thermal Visualization',
        description: 'See heat distribution from fixtures in 3D space',
        href: '/calculators/heat-load',
        highlights: ['Temperature gradients', 'HVAC integration', 'Hot spot detection', 'Cooling requirements']
      },
      {
        name: 'Vertical Farm Ray Tracing',
        description: 'Advanced multi-layer canopy ray tracing with spectral resolution and fluorescence modeling',
        href: '/demo/vertical-farm-raytracing',
        highlights: ['Beer-Lambert law modeling', 'Chlorophyll fluorescence', 'Volumetric scattering', 'Layer-specific optimization']
      },
      {
        name: 'Tall Plants Light Modeling',
        description: 'Specialized ray tracing for cannabis, tomatoes, and vine crops with intracanopy lighting analysis',
        href: '/demo/vertical-farm-raytracing/tall-plants',
        highlights: ['2-3m plant heights', 'Side lighting optimization', 'Vertical LAI distribution', 'Canopy penetration analysis']
      }
    ]
  },
  {
    title: 'Team Collaboration',
    description: 'Share designs and collaborate with your team',
    icon: Users,
    color: 'from-green-500 to-green-600',
    badge: 'BASIC',
    features: [
      {
        name: 'Design Sharing',
        description: 'Share designs with team members and stakeholders',
        href: '/design',
        highlights: ['Link sharing', 'Export options', 'View permissions', 'Comments']
      },
      {
        name: 'Project Management',
        description: 'Organize and manage design projects',
        href: '/design',
        highlights: ['Project folders', 'Save designs', 'Design history', 'Templates']
      },
      {
        name: 'Team Communication',
        description: 'Built-in chat for facility coordination and daily operations',
        href: '/chat',
        highlights: ['Channel-based messaging', 'File sharing', 'Mobile optimized', 'Facility-specific channels']
      },
      {
        name: 'User Management',
        description: 'Manage team access and permissions',
        href: '/settings',
        highlights: ['User roles', 'Access control', 'Team dashboard', 'Activity logs']
      }
    ]
  },
  {
    title: 'Equipment Investment Platform',
    description: 'Revolutionary equipment financing through revenue sharing partnerships',
    icon: Package,
    color: 'from-emerald-500 to-emerald-600',
    badge: 'LIVE',
    features: [
      {
        name: 'Equipment Request Board',
        description: 'Post equipment needs and receive offers from qualified investors',
        href: '/equipment-board',
        highlights: ['15% platform fee', 'Smart escrow protection', 'Performance-based payments', 'No upfront costs']
      },
      {
        name: 'Revenue Share Management',
        description: 'Automated revenue distribution and performance tracking',
        href: '/performance',
        highlights: ['Blockchain verification', 'Real-time monitoring', 'Automated calculations', 'Transparent reporting']
      },
      {
        name: 'Equipment Marketplace',
        description: 'Browse and submit offers on equipment investment opportunities',
        href: '/equipment-board/offers',
        highlights: ['Equipment matching', 'Investment portfolio', 'ROI projections', 'Risk assessment']
      }
    ]
  },
  {
    title: 'Professional Reports',
    description: 'Generate detailed reports that win projects and impress clients',
    icon: FileText,
    color: 'from-indigo-500 to-indigo-600',
    badge: 'ENHANCED',
    features: [
      {
        name: '16-Section Photometric Reports',
        description: 'Comprehensive lighting analysis reports with executive summaries',
        href: '/reports',
        highlights: ['Executive summary', 'Technical specifications', 'Energy analysis', 'ROI calculations']
      },
      {
        name: 'Custom Branded Reports',
        description: 'White-label reports with your company branding',
        href: '/reports',
        highlights: ['Logo placement', 'Custom colors', 'Contact info', 'Terms inclusion']
      },
      {
        name: 'Multi-format Export',
        description: 'Export reports in PDF, Excel, Word, and CAD formats',
        href: '/reports',
        highlights: ['PDF generation', 'Excel data export', 'CAD drawings', 'BIM integration']
      }
    ]
  },
  {
    title: 'Fixture Database',
    description: 'The most comprehensive horticultural lighting database available',
    icon: Database,
    color: 'from-orange-500 to-orange-600',
    badge: 'COMPREHENSIVE',
    features: [
      {
        name: 'DLC Fixture Library',
        description: 'Complete database of DLC qualified fixtures with daily updates',
        href: '/fixtures',
        highlights: ['Growing database', 'Multiple manufacturers', 'Pricing info', 'Spectral data']
      },
      {
        name: 'Smart Search & Filters',
        description: 'Advanced search with natural language queries',
        href: '/fixtures',
        highlights: ['Natural language search', 'Multi-parameter filters', 'Comparison tools', 'Favorites system']
      },
      {
        name: 'IES File Integration',
        description: 'Upload custom IES files for accurate photometric calculations',
        href: '/fixtures',
        highlights: ['IES file upload', 'Validation tools', 'Custom fixtures', 'Sharing library']
      }
    ]
  },
  {
    title: 'Enterprise Financial Analysis',
    description: 'Professional-grade investment analysis that turns greenhouse projects into profit centers',
    icon: DollarSign,
    color: 'from-emerald-500 to-green-600',
    badge: 'NEW',
    features: [
      {
        name: 'Integrated Solar + Greenhouse ROI',
        description: 'Comprehensive financial modeling combining facility and renewable energy investments',
        href: '/unified-financial-dashboard',
        highlights: ['Multi-scenario modeling', 'Solar + facility integration', 'Risk-adjusted analysis', 'Professional reports']
      },
      {
        name: 'Professional Investment Analysis',
        description: 'Institutional-quality financial modeling with sensitivity analysis and scenario planning',
        href: '/sam-tco-calculator',
        highlights: ['25-year cash flow projections', 'Federal/state incentive optimization', 'Time-of-use rate modeling', 'Monte Carlo risk analysis']
      },
      {
        name: 'Sustainability Impact Analysis',
        description: 'Quantify carbon reduction and explore premium market opportunities',
        href: '/calculators/financial',
        highlights: ['Carbon footprint calculator', 'Premium market analysis', 'ESG compliance tools', 'Sustainability reporting']
      }
    ]
  },
  {
    title: 'Advanced Calculators',
    description: 'Professional-grade calculators for every aspect of cultivation',
    icon: Calculator,
    color: 'from-violet-500 to-violet-600',
    badge: 'ENHANCED',
    features: [
      {
        name: 'Unified Calculator Suite',
        description: '25+ professional calculators organized by category (Environmental, Financial, Electrical)',
        href: '/calculators',
        highlights: ['6 calculator categories', 'Lazy loading', 'Multiple layouts', 'Export capabilities']
      },
      {
        name: 'Environmental Calculators',
        description: 'Advanced DLI, heat load, CO2 enrichment, psychrometric, and transpiration calculators with NOAA weather integration',
        href: '/calculators/environmental',
        highlights: ['Historical weather patterns', 'Climate risk assessment', 'Seasonal recommendations', 'Energy demand forecasting']
      },
      {
        name: 'Energy Independence Calculator',
        description: 'Model potential grid independence and energy savings with real weather data',
        href: '/calculators/financial',
        highlights: ['Grid independence modeling', 'Real weather data integration', 'Demand charge analysis', 'Net metering calculations']
      }
    ]
  },
  {
    title: 'Recipe Management',
    description: 'Create and manage lighting recipes for optimal growth',
    icon: FlaskConical,
    color: 'from-pink-500 to-pink-600',
    badge: 'ADVANCED',
    features: [
      {
        name: 'Crop Recipe Library',
        description: 'Pre-configured lighting recipes for optimal growth',
        href: '/light-recipes',
        highlights: ['Research-backed', 'Growth stage specific', 'Spectrum optimization', 'DLI recommendations']
      },
      {
        name: 'Custom Recipe Builder',
        description: 'Create and save custom lighting recipes',
        href: '/light-recipes',
        highlights: ['Photoperiod scheduling', 'Spectrum control', 'Intensity ramping', 'Sunrise/sunset simulation']
      },
      {
        name: 'Recipe Sharing',
        description: 'Share recipes with the community or keep them private',
        href: '/light-recipes',
        highlights: ['Community library', 'Private sharing', 'Version tracking', 'Performance data']
      }
    ]
  },
  {
    title: 'Multi-Site Management',
    description: 'Manage multiple facilities from a single dashboard',
    icon: Map,
    color: 'from-teal-500 to-teal-600',
    badge: 'ENTERPRISE',
    features: [
      {
        name: 'Facility Dashboard',
        description: 'Bird\'s eye view of all your facilities with satellite imagery and measurement tools',
        href: '/multi-site',
        highlights: ['Satellite map view', 'Measurement tools', 'Shadow analysis', 'Enhanced facility demos']
      },
      {
        name: 'Centralized Control',
        description: 'Control lighting across all facilities from one place',
        href: '/control-center',
        highlights: ['Remote adjustments', 'Schedule sync', 'Bulk updates', 'Override controls']
      },
      {
        name: 'Cross-Facility Analytics',
        description: 'Compare performance across different locations',
        href: '/analytics',
        highlights: ['Benchmarking', 'Best practices', 'Energy analysis', 'Yield comparison']
      }
    ]
  },
  {
    title: 'IoT & Automation',
    description: 'Complete device hub supporting MQTT, LoRaWAN, Modbus, HTTP, and WebSocket protocols',
    icon: Cpu,
    color: 'from-red-500 to-red-600',
    features: [
      {
        name: 'Multi-Protocol Device Hub',
        description: 'Connect devices via MQTT, LoRaWAN, Modbus, HTTP, and WebSocket protocols',
        href: '/iot/devices',
        highlights: ['5 protocol support', 'Climate sensors', 'Irrigation controls', 'Real-time monitoring']
      },
      {
        name: 'METRC Integration',
        description: 'Complete cannabis compliance with seed-to-sale tracking',
        href: '/compliance/metrc',
        highlights: ['Plant tracking', 'Package management', 'Lab test integration', 'Transfer compliance']
      },
      {
        name: 'API & Webhooks',
        description: 'Integrate with any system using our comprehensive API',
        href: '/api-docs',
        highlights: ['RESTful API', 'Webhooks', 'Real-time data', 'Custom integrations']
      }
    ]
  },
  {
    title: 'Document Processing & Analysis',
    description: 'OCR processing and compliance document automation',
    icon: FileText,
    color: 'from-indigo-500 to-purple-600',
    badge: 'NEW',
    features: [
      {
        name: 'OCR Document Processing',
        description: 'Multi-provider OCR with Tesseract, Google Vision, and AWS Textract support',
        href: '/api/documents/upload',
        highlights: ['Multiple OCR providers', 'Document classification', 'Structured data extraction', 'Compliance validation']
      },
      {
        name: 'Compliance Alert System',
        description: 'Smart web push notifications with facility-specific routing and severity-based prioritization',
        href: '/api/documents/compliance',
        highlights: ['License tracking', 'Smart push notifications', 'Severity-based routing', 'Cross-platform alerts']
      },
      {
        name: 'Document Search & Export',
        description: 'Advanced search with filtering and bulk export capabilities',
        href: '/api/documents/search',
        highlights: ['Text search', 'Date filtering', 'Batch export', 'Custom reports']
      }
    ]
  },
  {
    title: 'Mobile Tools',
    description: 'Mobile-responsive web interface for field operations',
    icon: Smartphone,
    color: 'from-cyan-500 to-cyan-600',
    features: [
      {
        name: 'Mobile-Responsive Design',
        description: 'Access design tools on mobile devices through web browser',
        href: '/design',
        highlights: ['Touch-friendly interface', 'Responsive layout', 'Mobile optimized', 'Cross-device sync']
      },
      {
        name: 'Employee Scouting App',
        description: 'Mobile scouting with AI-enhanced camera capture, auto-optimization, and GPS tracking',
        href: '/scouting',
        highlights: ['Auto-optimized photos (50% faster)', 'AI plant analysis', 'GPS coordinates', 'Background removal & enhancement']
      },
      {
        name: 'Mobile Dashboard',
        description: 'Monitor facility status on mobile devices',
        href: '/control-center',
        highlights: ['Mobile dashboard', 'Real-time alerts', 'Status monitoring', 'Quick actions']
      }
    ]
  },
  {
    title: 'Dispute Resolution System',
    description: 'Professional arbitration and conflict resolution for equipment partnerships',
    icon: Scale,
    color: 'from-red-500 to-orange-500',
    badge: 'SECURE',
    features: [
      {
        name: 'Smart Dispute Filing',
        description: 'Structured dispute submission with evidence management',
        href: '/disputes/new',
        highlights: ['Multi-step process', 'Evidence upload', 'Category classification', 'Priority levels']
      },
      {
        name: 'Professional Arbitration',
        description: 'Independent arbitrators resolve conflicts fairly',
        href: '/disputes',
        highlights: ['Certified arbitrators', 'Binding decisions', 'Quick resolution', 'Appeals process']
      },
      {
        name: 'Performance Protection',
        description: 'Automated triggers for performance-based disputes',
        href: '/performance',
        highlights: ['Sensor-based evidence', 'Real-time monitoring', 'Automated alerts', 'Fair resolution']
      }
    ]
  },
  {
    title: 'User Management & Onboarding',
    description: 'Streamlined user experience and authentication',
    icon: Users,
    color: 'from-cyan-600 to-blue-600',
    badge: 'ENHANCED',
    features: [
      {
        name: 'Multi-Factor Authentication',
        description: 'Secure login with OAuth and social providers',
        href: '/login',
        highlights: ['Google OAuth', 'GitHub integration', 'Email verification', 'Password recovery']
      },
      {
        name: 'Guided Onboarding',
        description: 'Step-by-step setup process for new users',
        href: '/get-started',
        highlights: ['Role selection', 'Facility setup', 'Equipment profiling', 'Integration guides']
      },
      {
        name: 'User Dashboard',
        description: 'Personalized dashboard based on user role',
        href: '/equipment-board',
        highlights: ['Role-based views', 'Custom widgets', 'Quick actions', 'Activity feeds']
      }
    ]
  },
  {
    title: 'Enterprise Features',
    description: 'Professional features for business operations',
    icon: Building,
    color: 'from-gray-600 to-gray-700',
    badge: 'BASIC',
    features: [
      {
        name: 'Professional Reports',
        description: 'Generate detailed reports for business use',
        href: '/reports',
        highlights: ['Custom branding', 'Multiple formats', 'Professional layouts', 'Export options']
      },
      {
        name: 'Data Security',
        description: 'Secure data handling and user authentication',
        href: '/security',
        highlights: ['OAuth integration', 'Data encryption', 'Secure storage', 'Access controls']
      },
      {
        name: 'Business Support',
        description: 'Professional support for business users',
        href: '/support',
        highlights: ['Priority support', 'Business hours', 'Technical assistance', 'Feature requests']
      }
    ]
  },
  {
    title: 'Predictive Maintenance AI',
    description: 'Framework for AI-powered maintenance optimization',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    badge: 'FRAMEWORK',
    features: [
      {
        name: 'Maintenance Tracking',
        description: 'Track equipment maintenance schedules and history',
        href: '/control-center',
        highlights: ['Maintenance logs', 'Schedule tracking', 'Equipment history', 'Task management']
      },
      {
        name: 'Equipment Monitoring',
        description: 'Monitor equipment performance and status',
        href: '/control-center',
        highlights: ['Status monitoring', 'Performance metrics', 'Alert system', 'Usage tracking']
      },
      {
        name: 'Predictive Framework',
        description: 'Foundation for future AI-powered maintenance features',
        href: '/control-center',
        highlights: ['Data collection', 'Pattern recognition ready', 'ML framework', 'Integration ready']
      }
    ]
  },
  {
    title: 'Research Suite ($399/mo)',
    description: 'Complete statistical analysis and experimental design platform',
    icon: FlaskConical,
    color: 'from-emerald-500 to-teal-600',
    badge: 'COMPLETE',
    features: [
      {
        name: 'Statistical Analysis Suite',
        description: 'ANOVA, regression, multivariate analysis, and post-hoc tests',
        href: '/research/statistical-analysis',
        highlights: ['One-way & factorial ANOVA', 'Multiple regression', 'Tukey & Bonferroni tests', 'Power analysis']
      },
      {
        name: 'Experimental Design Wizard',
        description: 'Design statistically rigorous experiments with proper randomization',
        href: '/research/experiment-designer',
        highlights: ['RCBD & factorial designs', 'Power calculations', 'Sample size optimizer', 'Protocol generation']
      },
      {
        name: 'Time-Lag Correlation Engine',
        description: 'Detect delayed plant responses to environmental changes',
        href: '/research-library',
        highlights: ['Correlation analysis', 'Configurable time windows', 'Plant response patterns', 'Statistical validation']
      },
      {
        name: 'Research Data Logger',
        description: 'Comprehensive data collection with mobile and sensor integration',
        href: '/research/data-logger',
        highlights: ['Mobile data entry', 'Sensor integration', 'Offline mode', 'Data validation']
      },
      {
        name: 'Literature Review AI',
        description: 'AI-powered research paper analysis and summarization',
        href: '/research/literature-review',
        highlights: ['Paper search', 'AI summaries', 'Citation management', 'Export to reference managers']
      },
      {
        name: 'Publication Reports',
        description: 'Generate publication-ready statistical reports and visualizations',
        href: '/research/reports',
        highlights: ['APA formatting', 'Export to R/Python', 'Interactive charts', 'Meta-analysis tools']
      }
    ]
  },
  {
    title: 'Energy Grid Integration',
    description: 'Advanced grid connectivity for revenue generation',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    badge: 'NEW',
    features: [
      {
        name: 'Real-Time Grid Pricing',
        description: 'Live energy pricing and automated optimization',
        href: '/energy',
        highlights: ['Time-of-use rates', 'Peak shaving', 'Load shifting', 'Price forecasting']
      },
      {
        name: 'Demand Response Programs',
        description: 'Participate in utility incentive programs',
        href: '/demand-response',
        highlights: ['Automated enrollment', 'Event participation', 'Revenue tracking', 'Performance analytics']
      },
      {
        name: 'Virtual Power Plant',
        description: 'Join collective energy markets for additional revenue',
        href: '/energy',
        highlights: ['Capacity aggregation', 'Market bidding', 'Revenue sharing', 'Real-time dispatch']
      }
    ]
  }
];

const stats = [
  { label: 'Core Features', value: '475+' },
  { label: 'Professional Calculators', value: '30+' },
  { label: 'Feature Categories', value: '20' },
  { label: 'Financial Models', value: 'Institutional-Grade' }
];

const additionalFeatures = [
  { icon: Shield, label: 'Group Insurance', desc: '40% savings' },
  { icon: Zap, label: 'Instant Payouts', desc: '< 24 hours' },
  { icon: Brain, label: 'Risk Prediction', desc: '92% accurate' },
  { icon: DollarSign, label: 'Premium Finance', desc: 'Flexible payment' },
  { icon: Camera, label: 'Auto Claims', desc: 'Sensor triggered' },
  { icon: GitBranch, label: 'Blockchain', desc: 'Smart contracts' },
  { icon: Target, label: '12+ Insurers', desc: 'Best rates' },
  { icon: BookOpen, label: 'Research Library', desc: '7 data sources' },
  { icon: FlaskConical, label: 'Time-Lag Analysis', desc: 'Plant responses' },
  { icon: Share2, label: 'Broker Portal', desc: 'Multi-client' },
  { icon: Battery, label: 'Equipment Coverage', desc: '100% protected' },
  { icon: Leaf, label: 'Crop Insurance', desc: 'Yield protection' }
];

export default function FeaturesPage() {
  return (
    <>
      <MarketingNavigation />
      <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-purple-900/20 to-gray-950 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 backdrop-blur-sm rounded-full border border-blue-700/50 mb-6"
          >
            <Building className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-200">Complete Cultivation Intelligence Platform - Design • Build • Operate</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            From Concept to Harvest,
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-green-600 bg-clip-text text-transparent">
              Complete Facility Intelligence
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto mb-8"
          >
            The only platform covering your complete facility lifecycle: AI-powered design, construction project management, 
            research-based cultivation protocols, professional IES photometric tools, and multi-facility operations - 
            all integrated in one comprehensive system.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-4"
          >
            <Link
              href="/design/advanced"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              Start Facility Design
            </Link>
            <Link
              href="/demo"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              Watch Demo
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900 rounded-xl p-6 text-center border border-gray-800"
            >
              <div className="text-3xl font-bold text-purple-400 mb-2">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feature Categories */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {featureCategories.map((category, categoryIndex) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="mb-20"
            >
              {/* Category Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className={`p-3 bg-gradient-to-br ${category.color} rounded-xl shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold">{category.title}</h2>
                    {category.badge && (
                      <span className={`px-3 py-1 ${
                        category.badge === 'NEW' ? 'bg-green-600' :
                        category.badge === 'BETA' ? 'bg-blue-600' :
                        category.badge === 'ENHANCED' ? 'bg-purple-600' :
                        category.badge === 'PREMIUM' ? 'bg-orange-600' :
                        'bg-gray-700'
                      } text-white text-xs font-semibold rounded-full`}>
                        {category.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400">{category.description}</p>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {category.features.map((feature) => (
                  <div
                    key={feature.name}
                    className="bg-gray-900 rounded-xl p-6 hover:bg-gray-800 transition-all duration-300 group border border-gray-800 hover:border-purple-700"
                  >
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                      {feature.name}
                    </h3>
                    <p className="text-gray-400 mb-4">{feature.description}</p>
                    <ul className="space-y-2 mb-6">
                      {feature.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-2 text-sm text-gray-300">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
                      <Shield className="w-4 h-4" />
                      <span>Premium Feature</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Additional Features */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Plus Everything Else You Need</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {additionalFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div 
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-800 rounded-lg mb-3">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-semibold mb-1">{item.label}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparison Section */}
      <div className="bg-gray-950 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Professionals Choose Vibelux</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-400 mb-4">450+</div>
              <h3 className="text-xl font-semibold mb-2">Core Features</h3>
              <p className="text-gray-400">Complete platform with professional calculators, AI tools, and automation</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-400 mb-4">6</div>
              <h3 className="text-xl font-semibold mb-2">Tomato Tools</h3>
              <p className="text-gray-400">Advanced Dutch Research cultivation protocols</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-400 mb-4">130M+</div>
              <h3 className="text-xl font-semibold mb-2">Research Papers</h3>
              <p className="text-gray-400">Research-backed recommendations and protocols</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-400 mb-4">18</div>
              <h3 className="text-xl font-semibold mb-2">Feature Categories</h3>
              <p className="text-gray-400">Complete platform for professional operations</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-purple-900/20 to-gray-950 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Optimize Your Entire Operation?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join professional growers using Vibelux for crop optimization, energy management, 
            equipment investment, and comprehensive facility intelligence.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/calculators"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              Try Calculators Free
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}