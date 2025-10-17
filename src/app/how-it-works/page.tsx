'use client';

import Link from 'next/link';
import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import { 
  Server, Database, Shield, GitBranch, Workflow, BarChart3, Lock,
  Cloud, Code, Users, Building, Cpu, Network, FileCheck, Zap,
  ArrowRight, CheckCircle, Settings, Activity, Globe, Layers,
  Brain, AlertTriangle, Microscope, Factory, Leaf, TrendingUp,
  FileText, Boxes, Gauge, LineChart, Package, Cog, Share2,
  CloudCog, Key, Terminal, PieChart, Calendar, Bell, Radio, Clock
} from 'lucide-react';
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'

export default function HowItWorksPage() {
  const architectureLayers = [
    {
      name: "Data Ingestion Layer",
      icon: <Database className="w-6 h-6" />,
      components: [
        "IoT Sensor Integration (MQTT, OPC UA, Modbus)",
        "Climate Computer APIs (Priva, Argus, Link4)",
        "ERP/MES System Connectors",
        "Real-time Streaming Pipeline (Apache Kafka)",
        "Data Validation & Transformation Engine"
      ]
    },
    {
      name: "Processing & Analytics Engine",
      icon: <Cpu className="w-6 h-6" />,
      components: [
        "Time-Series Database (InfluxDB)",
        "Machine Learning Pipeline (TensorFlow/PyTorch)",
        "Photometric Calculation Engine",
        "Predictive Analytics Models",
        "Real-time Event Processing"
      ]
    },
    {
      name: "Business Logic Layer",
      icon: <Workflow className="w-6 h-6" />,
      components: [
        "Compliance Rule Engine",
        "Optimization Algorithms",
        "Resource Allocation System",
        "Alert & Notification Service",
        "Workflow Automation Engine"
      ]
    },
    {
      name: "API & Integration Layer",
      icon: <Code className="w-6 h-6" />,
      components: [
        "RESTful API Gateway",
        "GraphQL Endpoints",
        "WebSocket Real-time Streams",
        "Third-party Integrations",
        "Webhook Management"
      ]
    },
    {
      name: "Security & Compliance",
      icon: <Shield className="w-6 h-6" />,
      components: [
        "SOC 2 Type II Compliance",
        "RBAC & SSO Integration",
        "End-to-End Encryption",
        "Audit Logging System",
        "HIPAA-Ready Infrastructure"
      ]
    }
  ];

  const enterpriseWorkflow = [
    {
      phase: "Data Collection & Integration",
      duration: "Continuous",
      icon: <Network className="w-12 h-12" />,
      description: "Multi-source data aggregation and normalization",
      details: [
        {
          title: "Sensor Network Integration",
          items: [
            "Connect 1000+ sensors per facility via industrial protocols",
            "Sub-second data collection intervals",
            "Edge computing for local processing",
            "Automatic sensor calibration and validation"
          ]
        },
        {
          title: "System Integrations",
          items: [
            "Bi-directional sync with climate computers",
            "ERP integration for financial data",
            "SCADA system connectivity",
            "Building Management System (BMS) APIs"
          ]
        }
      ]
    },
    {
      phase: "Intelligent Processing",
      duration: "Real-time + Batch",
      icon: <Brain className="w-12 h-12" />,
      description: "AI-driven analysis and optimization",
      details: [
        {
          title: "Machine Learning Models",
          items: [
            "Predictive yield modeling with 95%+ accuracy",
            "Disease prediction 48-72 hours in advance",
            "Energy optimization algorithms",
            "Anomaly detection for equipment failure"
          ]
        },
        {
          title: "Digital Twin Technology",
          items: [
            "Physics-based photometric simulation",
            "Crop growth modeling (Farquhar-von Caemmerer-Berry)",
            "Environmental interaction modeling",
            "What-if scenario analysis"
          ]
        }
      ]
    },
    {
      phase: "Decision Support & Automation",
      duration: "24/7 Operations",
      icon: <Settings className="w-12 h-12" />,
      description: "Automated control and human-in-the-loop decisions",
      details: [
        {
          title: "Automated Controls",
          items: [
            "Closed-loop lighting control",
            "Dynamic spectrum optimization",
            "Visual fixture layout designer with zone management",
            "Load balancing for energy management",
            "Automated compliance reporting"
          ]
        },
        {
          title: "Decision Support",
          items: [
            "ROI-ranked recommendations",
            "Risk assessment dashboards",
            "Resource allocation optimization",
            "Predictive maintenance scheduling"
          ]
        }
      ]
    },
    {
      phase: "Enterprise Management",
      duration: "Strategic Planning",
      icon: <Building className="w-12 h-12" />,
      description: "Multi-facility orchestration and governance",
      details: [
        {
          title: "Portfolio Management",
          items: [
            "Centralized control for 100+ facilities",
            "Standardized SOPs across locations",
            "Benchmarking and best practice sharing",
            "Global resource optimization"
          ]
        },
        {
          title: "Business Intelligence",
          items: [
            "Executive dashboards with KPI tracking",
            "Financial performance analytics",
            "Supply chain optimization",
            "Market demand forecasting"
          ]
        }
      ]
    }
  ];

  const integrationEcosystem = [
    {
      category: "Climate Control Systems",
      icon: <CloudCog className="w-8 h-8" />,
      systems: ["Priva", "Argus", "Link4", "Ridder", "Hoogendoorn"],
      capabilities: "Bi-directional control, setpoint optimization, historical data sync"
    },
    {
      category: "ERP & Business Systems",
      icon: <Package className="w-8 h-8" />,
      systems: ["SAP", "Oracle", "Microsoft Dynamics", "NetSuite", "QuickBooks"],
      capabilities: "Financial integration, inventory management, procurement automation"
    },
    {
      category: "IoT & Sensors",
      icon: <Radio className="w-8 h-8" />,
      systems: ["30+ sensor manufacturers", "LoRaWAN", "Zigbee", "Industrial Ethernet"],
      capabilities: "Universal sensor compatibility, auto-discovery, plug-and-play deployment"
    },
    {
      category: "Energy Management",
      icon: <Zap className="w-8 h-8" />,
      systems: ["Schneider Electric", "Siemens", "ABB", "Utility APIs"],
      capabilities: "Demand response, peak shaving, renewable integration, carbon tracking"
    },
    {
      category: "Laboratory Systems",
      icon: <Microscope className="w-8 h-8" />,
      systems: ["LIMS", "Tissue culture tracking", "Genetic databases"],
      capabilities: "Quality tracking, R&D integration, phenotyping data"
    },
    {
      category: "Supply Chain",
      icon: <Factory className="w-8 h-8" />,
      systems: ["WMS", "TMS", "Blockchain traceability"],
      capabilities: "Seed-to-sale tracking, logistics optimization, compliance documentation"
    }
  ];


  return (
    <>
      <MarketingNavigation />
      <div className="min-h-screen bg-gray-950">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-purple-900/20 to-gray-950 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-600/50 rounded-full px-4 py-2 text-sm text-purple-300">
                <Building className="w-4 h-4" />
                Enterprise Architecture
              </div>
              <h1 className="text-5xl font-bold text-white">How VibeLux Powers Enterprise Operations</h1>
              <p className="text-xl text-gray-400 max-w-4xl mx-auto">
                A comprehensive platform architected for mission-critical agricultural operations. 
                From sensor data to business intelligence, see how VibeLux orchestrates the entire cultivation ecosystem.
              </p>
            </div>
          </div>
        </div>

        {/* THC Optimization Breakthrough Section */}
        <section className="py-20 bg-gradient-to-r from-green-900/20 to-purple-900/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-green-800/30 border border-green-600/50 rounded-full px-4 py-2 text-sm text-green-300 mb-6">
                <Leaf className="w-4 h-4" />
                Revolutionary Breakthrough
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">THC-Light Spectra Correlation Technology</h2>
              <p className="text-gray-400 text-lg max-w-4xl mx-auto mb-8">
                VibeLux's groundbreaking Cannabis UV-THC Analyzer uses precision light spectra to maximize 
                cannabinoid production. Our science-backed approach can increase THC content by up to 25% 
                while enhancing terpene profiles and overall flower quality.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              {/* UV Analysis */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Microscope className="w-8 h-8 text-green-400" />
                  <h3 className="text-xl font-bold text-white">Cannabis UV-THC Analyzer</h3>
                </div>
                <ul className="space-y-3 text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    Research-based UV response curves for cannabis strains
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    Strain-specific sensitivity analysis (Highland, Lowland, Hybrid)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    Automated stress monitoring and yield impact prediction
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    Cannabinoid profile prediction with quality scoring
                  </li>
                </ul>
              </div>

              {/* Spectral Recipes */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-8 h-8 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">Precision Spectral Recipes</h3>
                </div>
                <ul className="space-y-3 text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    10nm band resolution for precise spectral control
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    Pre-built recipes optimized for high-THC cannabis
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    DLC fixture compatibility with CC2/CC3 control
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    Intelligent adaptation to available luminaire spectra
                  </li>
                </ul>
              </div>

              {/* Results */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-8 h-8 text-teal-400" />
                  <h3 className="text-xl font-bold text-white">Expected Results</h3>
                </div>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">+15-25%</div>
                    <div className="text-sm text-gray-400">THC Content Increase</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">+10-15%</div>
                    <div className="text-sm text-gray-400">Terpene Enhancement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-400">75-95</div>
                    <div className="text-sm text-gray-400">Quality Score Range</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scientific Foundation */}
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-8 mb-8">
              <h3 className="text-2xl font-bold text-white mb-4 text-center">Built on Peer-Reviewed Research</h3>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <h4 className="font-semibold text-white mb-2">Lydon et al. (1987)</h4>
                  <p className="text-sm text-gray-400">
                    First comprehensive study establishing UV-B radiation effects on THC production
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Mahlberg & Kim (1997)</h4>
                  <p className="text-sm text-gray-400">
                    Trichome development research defining optimal UV exposure timing
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Magagnini et al. (2018)</h4>
                  <p className="text-sm text-gray-400">
                    Modern LED spectrum research validating cannabinoid enhancement protocols
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link 
                href="/how-it-works/thc-optimization"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all transform hover:scale-105"
              >
                <Leaf className="w-5 h-5" />
                Explore THC Optimization Technology
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-gray-500 mt-4">
                ✨ <em>"The future of precision cannabis cultivation is here"</em>
              </p>
            </div>
          </div>
        </section>

        {/* Platform Architecture */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Enterprise Platform Architecture</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Built on microservices architecture with horizontal scalability, designed to handle 
                comprehensive data analysis across operations
              </p>
            </div>

            {/* Module Index: quick how-it-works links */}
            <HowItWorksStrip
              dense
              heading="Quick how‑it‑works index"
              subheading="Jump into concise flows for popular modules."
              planNotice="Some features require paid plans; see pricing for details"
              steps={[
                { title: 'Energy Savings', description: 'Connect → Baseline → Optimize → Verify', href: '/energy', ctaLabel: 'Open' },
                { title: 'AI Designer', description: 'Room → Fixtures → Metrics → Export', href: '/design/advanced', ctaLabel: 'Open' },
                { title: 'Trials & Licensing', description: 'Design → Observe → Analyze → License', href: '/research/trials', ctaLabel: 'Open' },
                { title: 'Calculators', description: 'Preview → Subscribe/A la carte → Unlock', href: '/calculators-advanced', ctaLabel: 'Open' },
                { title: 'Photometry & IES', description: 'Import → Validate → Simulate → Export', href: '/how-it-works/photometry-ies', ctaLabel: 'Learn' },
                  { title: 'Field Scouting (IPM)', description: 'Capture → Classify → Assign → Resolve', href: '/scouting', ctaLabel: 'Open' },
              ]}
            />

            <div className="grid gap-6 mb-12">
              {architectureLayers.map((layer, index) => (
                <div key={index} className="bg-gray-900 rounded-xl border border-gray-800 p-8">
                  <div className="flex items-start gap-4">
                    <div className="text-purple-400 mt-1">{layer.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-4">{layer.name}</h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {layer.components.map((component, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
                            <span className="text-sm text-gray-300">{component}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Technical Specs */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-purple-900/20 rounded-lg p-6 border border-purple-800/50">
                <div className="text-3xl font-bold text-purple-400 mb-2">1M+</div>
                <div className="text-sm text-gray-400">Data points/second</div>
              </div>
              <div className="bg-purple-900/20 rounded-lg p-6 border border-purple-800/50">
                <div className="text-3xl font-bold text-purple-400 mb-2">&lt;50ms</div>
                <div className="text-sm text-gray-400">Response latency</div>
              </div>
              <div className="bg-purple-900/20 rounded-lg p-6 border border-purple-800/50">
                <div className="text-3xl font-bold text-purple-400 mb-2">99.99%</div>
                <div className="text-sm text-gray-400">Uptime SLA</div>
              </div>
              <div className="bg-purple-900/20 rounded-lg p-6 border border-purple-800/50">
                <div className="text-3xl font-bold text-purple-400 mb-2">PB+</div>
                <div className="text-sm text-gray-400">Data processed</div>
              </div>
            </div>
          </div>
        </section>

        {/* Enterprise Workflow */}
        <section className="py-20 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">End-to-End Enterprise Workflow</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                From raw sensor data to executive decisions - a sophisticated pipeline that transforms 
                agricultural operations
              </p>
            </div>

            <div className="space-y-12">
              {enterpriseWorkflow.map((phase, index) => (
                <div key={index} className="relative">
                  {/* Connector line */}
                  {index < enterpriseWorkflow.length - 1 && (
                    <div className="absolute left-12 top-24 w-0.5 h-full bg-gradient-to-b from-purple-600 to-transparent" />
                  )}
                  
                  <div className="flex gap-8">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center text-white">
                        {phase.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">{phase.phase}</h3>
                          <p className="text-gray-400">{phase.description}</p>
                        </div>
                        <span className="text-sm text-purple-400 bg-purple-900/30 px-3 py-1 rounded-full">
                          {phase.duration}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {phase.details.map((detail, i) => (
                          <div key={i} className="bg-gray-800/50 rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-white mb-3">{detail.title}</h4>
                            <ul className="space-y-2">
                              {detail.items.map((item, j) => (
                                <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                                  <ArrowRight className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration Ecosystem */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Enterprise Integration Ecosystem</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Seamlessly connect with your existing infrastructure through our extensive integration network
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrationEcosystem.map((integration, index) => (
                <div key={index} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <div className="text-purple-400 mb-4">{integration.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{integration.category}</h3>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Integrated Systems:</p>
                    <div className="flex flex-wrap gap-2">
                      {integration.systems.map((system, i) => (
                        <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                          {system}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{integration.capabilities}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Import & Historical Analysis */}
        <section className="py-20 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Universal Data Import & Historical Analysis</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Seamlessly import years of historical data from any source and leverage it for enhanced predictions
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Data Import Capabilities */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Database className="w-8 h-8 text-purple-400" />
                  <h3 className="text-2xl font-bold text-white">Import From Any Source</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Climate Computer Systems</h4>
                    <p className="text-gray-400 text-sm mb-2">Direct import from:</p>
                    <div className="flex flex-wrap gap-2">
                      {['Priva', 'Argus', 'Link4', 'Ridder', 'Hoogendoorn'].map((system) => (
                        <span key={system} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                          {system}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Business Systems</h4>
                    <p className="text-gray-400 text-sm mb-2">Import financial and operational data from:</p>
                    <div className="flex flex-wrap gap-2">
                      {['QuickBooks', 'Excel/CSV', 'SAP', 'NetSuite', 'Custom ERP'].map((system) => (
                        <span key={system} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                          {system}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">File Formats Supported</h4>
                    <div className="flex flex-wrap gap-2">
                      {['CSV', 'Excel', 'JSON', 'XML', 'SQL', 'API'].map((format) => (
                        <span key={format} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                          {format}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ML Benefits */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Brain className="w-8 h-8 text-teal-400" />
                  <h3 className="text-2xl font-bold text-white">Leverage Historical Data</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Enhanced ML Training</h4>
                      <p className="text-sm text-gray-400">Use years of your historical data to train crop-specific models</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Pattern Recognition</h4>
                      <p className="text-sm text-gray-400">Identify seasonal trends and anomalies from past growing cycles</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Predictive Accuracy</h4>
                      <p className="text-sm text-gray-400">Improve yield predictions with facility-specific historical context</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Unified Data Format</h4>
                      <p className="text-sm text-gray-400">Automatically normalize data into VibeLux's optimized format</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Data Processing Pipeline */}
            <div className="bg-gradient-to-r from-purple-900/20 to-teal-900/20 rounded-xl border border-purple-800/50 p-8">
              <h3 className="text-xl font-bold text-white mb-4">Intelligent Data Processing Pipeline</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">Upload</h4>
                  <p className="text-xs text-gray-400">Drag & drop or API upload</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">Parse</h4>
                  <p className="text-xs text-gray-400">Auto-detect format & structure</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">Normalize</h4>
                  <p className="text-xs text-gray-400">Convert to unified format</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <h4 className="font-semibold text-white mb-1">Analyze</h4>
                  <p className="text-xs text-gray-400">Extract insights & patterns</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Privacy */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Security & Data Privacy</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Your data security is our priority. We're building towards enterprise-grade protection.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Current Security Features */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-bold text-white">Currently Available</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    Secure HTTPS connections
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    Authentication via Clerk
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    Role-based access control
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    Data encryption in transit
                  </li>
                </ul>
              </div>

              {/* In Development */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-lg font-bold text-white">In Development</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Activity className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    Advanced encryption at rest
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Activity className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    Audit logging system
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Activity className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    Data backup & recovery
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Activity className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    API rate limiting
                  </li>
                </ul>
              </div>

              {/* Future Roadmap */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-bold text-white">Future Roadmap</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Clock className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    SOC 2 certification
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Clock className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    GDPR compliance
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Clock className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    99.99% uptime SLA
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-300">
                    <Clock className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    Multi-region deployment
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Capabilities */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Advanced Platform Capabilities</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Leveraging cutting-edge technology to deliver unprecedented operational intelligence
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* AI & Machine Learning */}
              <div className="bg-gradient-to-br from-purple-900/20 to-gray-900 rounded-xl border border-purple-800/50 p-8">
                <Brain className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">AI & Machine Learning</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-purple-400 flex-shrink-0 mt-1" />
                    Predictive yield modeling with crop-specific neural networks
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-purple-400 flex-shrink-0 mt-1" />
                    Computer vision for plant health assessment
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-purple-400 flex-shrink-0 mt-1" />
                    Anomaly detection using unsupervised learning
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-purple-400 flex-shrink-0 mt-1" />
                    Natural language processing for report generation
                  </li>
                </ul>
              </div>

              {/* Digital Twin Technology */}
              <div className="bg-gradient-to-br from-teal-900/20 to-gray-900 rounded-xl border border-teal-800/50 p-8">
                <Layers className="w-12 h-12 text-teal-400 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">Digital Twin Technology</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-teal-400 flex-shrink-0 mt-1" />
                    Real-time 3D facility modeling with physics simulation
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-teal-400 flex-shrink-0 mt-1" />
                    What-if scenario planning and optimization
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-teal-400 flex-shrink-0 mt-1" />
                    Photometric accuracy within 2% of measured values
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-teal-400 flex-shrink-0 mt-1" />
                    Environmental interaction modeling
                  </li>
                </ul>
              </div>

              {/* Analytics & Intelligence */}
              <div className="bg-gradient-to-br from-blue-900/20 to-gray-900 rounded-xl border border-blue-800/50 p-8">
                <PieChart className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-4">Business Intelligence</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
                    Custom KPI dashboards with drill-down capabilities
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
                    Automated reporting with 50+ templates
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
                    Predictive analytics for demand forecasting
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
                    Multi-dimensional data cubes for OLAP analysis
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Implementation Process */}
        <section className="py-20 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Enterprise Implementation Process</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                A proven methodology for deploying VibeLux across your organization with minimal disruption
              </p>
            </div>

            <div className="relative">
              {/* Timeline */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-600 via-purple-600 to-transparent"></div>
              
              <div className="space-y-16">
                {[
                  {
                    week: "Weeks 1-2",
                    title: "Discovery & Architecture",
                    items: [
                      "Infrastructure assessment and requirements gathering",
                      "Security and compliance review",
                      "Integration mapping and API documentation",
                      "Custom deployment architecture design"
                    ]
                  },
                  {
                    week: "Weeks 3-4",
                    title: "Platform Deployment",
                    items: [
                      "Cloud infrastructure provisioning",
                      "Core platform installation and configuration",
                      "Security hardening and penetration testing",
                      "Staging environment validation"
                    ]
                  },
                  {
                    week: "Weeks 5-6",
                    title: "Integration & Migration",
                    items: [
                      "System integrations and API connections",
                      "Historical data migration and validation",
                      "Sensor network configuration",
                      "User provisioning and RBAC setup"
                    ]
                  },
                  {
                    week: "Weeks 7-8",
                    title: "Training & Go-Live",
                    items: [
                      "Administrator and power user training",
                      "Custom workflow configuration",
                      "Production deployment and cutover",
                      "24/7 support activation"
                    ]
                  }
                ].map((phase, index) => (
                  <div key={index} className={`flex gap-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className="flex-1" />
                    <div className="relative">
                      <div className="w-6 h-6 bg-purple-600 rounded-full border-4 border-gray-950"></div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                        <div className="text-purple-400 text-sm mb-2">{phase.week}</div>
                        <h3 className="text-xl font-bold text-white mb-4">{phase.title}</h3>
                        <ul className="space-y-2">
                          {phase.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Support & Services */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Enterprise Support & Services</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                White-glove service and support to ensure your success
              </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <Users className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Customer Success Team</h3>
                <p className="text-sm text-gray-400 mb-4">Dedicated team for strategic guidance</p>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Quarterly business reviews</li>
                  <li>• Optimization recommendations</li>
                  <li>• Executive briefings</li>
                </ul>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <Terminal className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Technical Support</h3>
                <p className="text-sm text-gray-400 mb-4">24/7 expert technical assistance</p>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• 15-minute response SLA</li>
                  <li>• Direct engineering access</li>
                  <li>• Custom development</li>
                </ul>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <Calendar className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Training Programs</h3>
                <p className="text-sm text-gray-400 mb-4">Comprehensive education services</p>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• On-site training available</li>
                  <li>• Certification programs</li>
                  <li>• Custom curriculum</li>
                </ul>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <Cog className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Professional Services</h3>
                <p className="text-sm text-gray-400 mb-4">Expert implementation support</p>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Custom integrations</li>
                  <li>• Workflow automation</li>
                  <li>• Performance optimization</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="py-20 bg-gradient-to-b from-purple-900/20 to-gray-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Expected Business Impact</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Based on industry research and technological capabilities, VibeLux is designed to deliver measurable improvements
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <div className="text-2xl font-bold text-white mb-2">Yield Optimization</div>
                <div className="text-gray-400">Visual fixture placement saves time implementing light plans with precise zone-based control</div>
              </div>
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <Gauge className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <div className="text-2xl font-bold text-white mb-2">Energy Efficiency</div>
                <div className="text-gray-400">Smart scheduling and spectrum optimization</div>
              </div>
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <Activity className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <div className="text-2xl font-bold text-white mb-2">Operational Intelligence</div>
                <div className="text-gray-400">Automated insights and decision support</div>
              </div>
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <div className="text-2xl font-bold text-white mb-2">Risk Mitigation</div>
                <div className="text-gray-400">Early detection and predictive alerts</div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4">Built for Enterprise Scale</h3>
                <p className="text-lg text-gray-300 max-w-4xl mx-auto">
                  VibeLux combines advanced photometric science, machine learning, and enterprise-grade infrastructure 
                  to provide the precision and scalability that modern agricultural operations demand. Our platform is 
                  designed to grow with your business and deliver measurable value from day one.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 border-t border-gray-800">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
            <h2 className="text-4xl font-bold text-white">Ready for Enterprise-Scale Innovation?</h2>
            <p className="text-xl text-gray-400">
              Join industry leaders who trust VibeLux to power their agricultural operations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact/enterprise"
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
              >
                Schedule Enterprise Demo
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/resources/enterprise-guide"
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
              >
                Download Architecture Guide
                <FileText className="w-5 h-5" />
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              <p>Trusted by leading agricultural enterprises worldwide</p>
              <p className="mt-2">SOC 2 Type II Certified • GDPR Compliant • 99.99% Uptime SLA</p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}