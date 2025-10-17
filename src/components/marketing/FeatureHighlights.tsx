import React from 'react'
import { 
  Shield, 
  Smartphone, 
  Building2, 
  Code2, 
  Users, 
  FileText,
  Zap,
  DollarSign,
  Link2,
  BarChart3
} from 'lucide-react'

export default function FeatureHighlights() {
  const features = [
    {
      icon: Building2,
      title: "Multi-Facility Management",
      description: "Manage unlimited facilities from one dashboard. Compare performance, share best practices, and optimize across locations.",
      highlight: "Enterprise-Ready"
    },
    {
      icon: Smartphone,
      title: "Mobile & Offline Apps",
      description: "Native mobile apps with offline sync. Your team can work anywhere, even without internet.",
      highlight: "iOS & Android"
    },
    {
      icon: Code2,
      title: "Developer API",
      description: "RESTful API with webhooks, SDKs, and comprehensive documentation. Build custom integrations.",
      highlight: "API-First"
    },
    {
      icon: DollarSign,
      title: "Affiliate Program",
      description: "Earn 20-40% recurring commissions. Full dashboard, tracking, and automated payouts.",
      highlight: "Earn Revenue"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "SSO/SAML, MFA, encryption at rest, automated backups, and disaster recovery.",
      highlight: "SOC 2 Ready"
    },
    {
      icon: Link2,
      title: "100+ Integrations",
      description: "Connect with Priva, Argus, QuickBooks, SAP, CMMS systems, and more.",
      highlight: "Pre-Built"
    },
    {
      icon: FileText,
      title: "Compliance Suite",
      description: "GMP, GAP, CEA food safety, and quality management with audit trails.",
      highlight: "Stay Compliant"
    },
    {
      icon: BarChart3,
      title: "AI & Analytics",
      description: "Machine learning predictions, computer vision, and advanced statistical analysis.",
      highlight: "Predictive"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Real-time collaboration, video calls, task management, and activity tracking.",
      highlight: "Work Together"
    },
    {
      icon: Zap,
      title: "Automation Hub",
      description: "Automate billing, maintenance, alerts, and workflows. Save 10+ hours per week.",
      highlight: "Autopilot"
    }
  ]

  return (
    <section className="py-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything You Need, Nothing You Don't
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            While others focus on one feature, we've built the complete platform. 
            Every tool you need to run a successful cultivation operation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="relative group bg-gray-900/50 rounded-xl p-6 hover:bg-gray-900 transition-all duration-300 border border-gray-800 hover:border-purple-600/50"
            >
              <div className="absolute top-4 right-4 text-xs font-semibold text-purple-400 bg-purple-900/20 px-2 py-1 rounded">
                {feature.highlight}
              </div>
              
              <feature.icon className="w-10 h-10 text-purple-500 mb-4" />
              
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              
              <p className="text-gray-400 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-500 mb-8">
            Plus: Equipment tracking, RFID/barcode scanning, experiment tracking, 
            genetic optimization, time-series databases, and 50+ more features
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/features" 
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              Explore All Features
            </a>
            <a 
              href="/pricing" 
              className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
            >
              View Pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}