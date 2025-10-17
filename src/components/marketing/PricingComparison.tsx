import React from 'react'
import { Check, X } from 'lucide-react'

export default function PricingComparison() {
  const features = [
    {
      category: "Core Features",
      items: [
        { name: "3D Design Studio & CAD Import", free: true, essential: true, professional: true, enterprise: true },
        { name: "25+ Calculators & Tools", free: true, essential: true, professional: true, enterprise: true },
        { name: "Lighting Layout Designer", free: true, essential: true, professional: true, enterprise: true },
        { name: "DLC Fixture Database", free: true, essential: true, professional: true, enterprise: true },
        { name: "Basic Reports", free: true, essential: true, professional: true, enterprise: true },
      ]
    },
    {
      category: "Team & Collaboration",
      items: [
        { name: "Team Members", free: "1 user", essential: "3 users", professional: "10 users", enterprise: "Unlimited" },
        { name: "Multi-Facility Management", free: false, essential: false, professional: true, enterprise: true },
        { name: "Real-time Collaboration", free: false, essential: false, professional: true, enterprise: true },
        { name: "Video Calls & Screen Share", free: false, essential: false, professional: true, enterprise: true },
        { name: "Activity Tracking", free: false, essential: true, professional: true, enterprise: true },
      ]
    },
    {
      category: "Mobile & API",
      items: [
        { name: "Mobile Apps (iOS/Android)", free: false, essential: true, professional: true, enterprise: true },
        { name: "Offline Sync", free: false, essential: true, professional: true, enterprise: true },
        { name: "API Access", free: false, essential: "Read-only", professional: "Full", enterprise: "Full + Webhooks" },
        { name: "Custom Integrations", free: false, essential: false, professional: true, enterprise: true },
        { name: "SDK & Documentation", free: false, essential: false, professional: true, enterprise: true },
      ]
    },
    {
      category: "Automation & AI",
      items: [
        { name: "Automated Billing", free: false, essential: true, professional: true, enterprise: true },
        { name: "Workflow Automation", free: false, essential: false, professional: true, enterprise: true },
        { name: "AI Predictions", free: false, essential: false, professional: true, enterprise: true },
        { name: "Computer Vision Analysis", free: false, essential: false, professional: true, enterprise: true },
        { name: "Advanced Analytics", free: false, essential: false, professional: true, enterprise: true },
      ]
    },
    {
      category: "Enterprise Features",
      items: [
        { name: "SSO/SAML Authentication", free: false, essential: false, professional: false, enterprise: true },
        { name: "Automated Backups", free: false, essential: "Daily", professional: "Hourly", enterprise: "Real-time" },
        { name: "Disaster Recovery", free: false, essential: false, professional: false, enterprise: true },
        { name: "Custom Branding", free: false, essential: false, professional: "Logo", enterprise: "Full" },
        { name: "Dedicated Support", free: false, essential: "Email", professional: "Priority", enterprise: "24/7 + Account Manager" },
      ]
    },
    {
      category: "Compliance & Security",
      items: [
        { name: "Audit Trails", free: false, essential: true, professional: true, enterprise: true },
        { name: "GMP/GAP Compliance", free: false, essential: false, professional: true, enterprise: true },
        { name: "Multi-Factor Auth", free: false, essential: true, professional: true, enterprise: true },
        { name: "Data Encryption", free: "Basic", essential: "Standard", professional: "Advanced", enterprise: "Military-grade" },
        { name: "Security Scanning", free: false, essential: false, professional: true, enterprise: true },
      ]
    },
    {
      category: "Integrations",
      items: [
        { name: "Climate Computers", free: false, essential: "2", professional: "10", enterprise: "Unlimited" },
        { name: "Accounting Software", free: false, essential: false, professional: true, enterprise: true },
        { name: "CMMS Integration", free: false, essential: false, professional: true, enterprise: true },
        { name: "ERP Systems", free: false, essential: false, professional: false, enterprise: true },
        { name: "Custom Webhooks", free: false, essential: false, professional: "10", enterprise: "Unlimited" },
      ]
    }
  ]

  const plans = [
    { key: 'free', name: 'Free', price: '$0', color: 'gray' },
    { key: 'essential', name: 'Essential', price: '$99', color: 'blue' },
    { key: 'professional', name: 'Professional', price: '$299', color: 'purple', popular: true },
    { key: 'enterprise', name: 'Enterprise', price: 'Custom', color: 'green' },
  ]

  const renderFeatureValue = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-gray-600" />
    }
    return <span className="text-sm text-gray-300">{value}</span>
  }

  return (
    <div className="py-16 bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Compare Plans & Features
          </h2>
          <p className="text-gray-400">
            See everything included in each plan. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-4 text-gray-400 font-normal">Features</th>
                {plans.map(plan => (
                  <th key={plan.key} className="text-center p-4">
                    <div className={`inline-block ${plan.popular ? 'relative' : ''}`}>
                      {plan.popular && (
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
                          Most Popular
                        </div>
                      )}
                      <div className="font-semibold text-white">{plan.name}</div>
                      <div className="text-2xl font-bold text-white mt-1">{plan.price}</div>
                      <div className="text-sm text-gray-400">per month</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((category, categoryIndex) => (
                <React.Fragment key={categoryIndex}>
                  <tr className="border-t border-gray-800">
                    <td colSpan={5} className="pt-8 pb-4 px-4">
                      <h3 className="font-semibold text-white">{category.category}</h3>
                    </td>
                  </tr>
                  {category.items.map((feature, featureIndex) => (
                    <tr key={featureIndex} className="border-t border-gray-900">
                      <td className="p-4 text-gray-300">{feature.name}</td>
                      <td className="p-4 text-center">{renderFeatureValue(feature.free)}</td>
                      <td className="p-4 text-center">{renderFeatureValue(feature.essential)}</td>
                      <td className="p-4 text-center bg-purple-900/10">{renderFeatureValue(feature.professional)}</td>
                      <td className="p-4 text-center">{renderFeatureValue(feature.enterprise)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 bg-purple-900/20 rounded-xl p-8 border border-purple-800">
          <h3 className="text-xl font-semibold text-white mb-4">
            🎯 Affiliate Program - Earn 20-40% Recurring Commissions
          </h3>
          <p className="text-gray-300 mb-6">
            Join our affiliate program and earn recurring commissions on every customer you refer. 
            Get your own dashboard, tracking links, and automated monthly payouts.
          </p>
          <a 
            href="/affiliates" 
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Become an Affiliate
          </a>
        </div>
      </div>
    </div>
  )
}