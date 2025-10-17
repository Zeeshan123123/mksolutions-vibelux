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
  CloudCog, Key, Terminal, PieChart, Calendar, Bell, Radio
} from 'lucide-react';

export default function EnterpriseHowItWorks() {
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

  const securityFeatures = [
    {
      title: "Infrastructure Security",
      icon: <Server className="w-6 h-6" />,
      features: [
        "AWS/Azure multi-region deployment",
        "99.99% uptime SLA",
        "Disaster recovery with RPO < 1 hour",
        "Geographic data redundancy"
      ]
    },
    {
      title: "Data Protection",
      icon: <Lock className="w-6 h-6" />,
      features: [
        "AES-256 encryption at rest",
        "TLS 1.3 in transit",
        "Customer-managed encryption keys",
        "Data residency compliance"
      ]
    },
    {
      title: "Access Control",
      icon: <Key className="w-6 h-6" />,
      features: [
        "SAML 2.0 / OAuth 2.0 SSO",
        "Multi-factor authentication",
        "Role-based permissions (50+ roles)",
        "API key management"
      ]
    },
    {
      title: "Compliance",
      icon: <FileCheck className="w-6 h-6" />,
      features: [
        "SOC 2 Type II certified",
        "GDPR / CCPA compliant",
        "FDA 21 CFR Part 11 ready",
        "ISO 27001 aligned"
      ]
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

        {/* Platform Architecture */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Enterprise Platform Architecture</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Built on microservices architecture with horizontal scalability, designed to handle 
                millions of data points per second across global operations
              </p>
            </div>

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

        {/* Security & Compliance */}
        <section className="py-20 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Enterprise-Grade Security & Compliance</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Built from the ground up with security-first architecture to protect your most sensitive data
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {securityFeatures.map((section, index) => (
                <div key={index} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-purple-400">{section.icon}</div>
                    <h3 className="text-lg font-bold text-white">{section.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {section.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
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

        {/* ROI Section */}
        <section className="py-20 bg-gradient-to-b from-purple-900/20 to-gray-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Proven Enterprise ROI</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                Real results from enterprise deployments across the industry
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-white mb-2">23%</div>
                <div className="text-gray-400">Average yield increase</div>
              </div>
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <Gauge className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-white mb-2">37%</div>
                <div className="text-gray-400">Energy cost reduction</div>
              </div>
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <Activity className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-white mb-2">94%</div>
                <div className="text-gray-400">Operational efficiency gain</div>
              </div>
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-white mb-2">68%</div>
                <div className="text-gray-400">Reduction in crop loss</div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-8">
              <blockquote className="text-xl text-gray-300 italic text-center">
                "VibeLux transformed our multi-facility operations. The real-time visibility and predictive 
                capabilities have reduced our operational costs by 40% while increasing quality and yield. 
                It's not just software - it's a competitive advantage."
              </blockquote>
              <p className="text-center mt-4 text-gray-400">
                — VP of Operations, Fortune 500 AgTech Company
              </p>
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