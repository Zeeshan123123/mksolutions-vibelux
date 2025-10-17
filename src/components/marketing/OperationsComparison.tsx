'use client';

import { Check, X } from 'lucide-react';

export function OperationsComparison() {
  const features = [
    { category: 'Daily Management', features: [
      { name: 'Environmental Monitoring', traditional: true, vibelux: true },
      { name: 'Shift Handoffs & Notes', traditional: false, vibelux: true },
      { name: 'Harvest Planning & Tracking', traditional: false, vibelux: true },
      { name: 'Task Assignment & Workflows', traditional: false, vibelux: true },
      { name: 'Team Communication Hub', traditional: false, vibelux: true },
    ]},
    { category: 'Inventory & Supply Chain', features: [
      { name: 'Basic Inventory Tracking', traditional: true, vibelux: true },
      { name: 'Automated Reorder Points', traditional: false, vibelux: true },
      { name: 'Batch & Lot Control', traditional: false, vibelux: true },
      { name: 'Expiry Management', traditional: false, vibelux: true },
      { name: 'Consumption Analytics', traditional: false, vibelux: true },
    ]},
    { category: 'Customer Management', features: [
      { name: 'Basic Order Tracking', traditional: true, vibelux: true },
      { name: 'Customer Relationship Management', traditional: false, vibelux: true },
      { name: 'Automated Invoicing', traditional: false, vibelux: true },
      { name: 'Payment Status Tracking', traditional: false, vibelux: true },
      { name: 'Order-to-Cash Workflow', traditional: false, vibelux: true },
    ]},
    { category: 'Compliance & Documentation', features: [
      { name: 'Manual Record Keeping', traditional: true, vibelux: true },
      { name: 'Automated Workflow Engine', traditional: false, vibelux: true },
      { name: 'Evidence Collection', traditional: false, vibelux: true },
      { name: 'Audit Trail Generation', traditional: false, vibelux: true },
      { name: 'Inspection Readiness Dashboard', traditional: false, vibelux: true },
    ]},
    { category: 'Knowledge Management', features: [
      { name: 'Document Storage', traditional: true, vibelux: true },
      { name: 'Version-Controlled SOPs', traditional: false, vibelux: true },
      { name: 'Training Records', traditional: false, vibelux: true },
      { name: 'Interactive Content', traditional: false, vibelux: true },
      { name: 'Certification Tracking', traditional: false, vibelux: true },
    ]},
  ];

  return (
    <section className="py-20 px-6 lg:px-8 bg-gray-900/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Traditional Monitoring vs. VibeLux Operations
          </h2>
          <p className="text-xl text-gray-400">
            See why leading growers are switching to complete operational management
          </p>
        </div>

        <div className="bg-gray-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-900">
            <div className="p-6">
              <h3 className="font-semibold text-gray-400">Feature</h3>
            </div>
            <div className="p-6 text-center border-x border-gray-700">
              <h3 className="font-semibold text-gray-400">Traditional Monitoring</h3>
              <p className="text-sm text-gray-500 mt-1">Multiple tools, manual processes</p>
            </div>
            <div className="p-6 text-center bg-gradient-to-r from-green-900/20 to-emerald-900/20">
              <h3 className="font-semibold text-green-400">VibeLux Operations</h3>
              <p className="text-sm text-green-400/70 mt-1">Everything integrated</p>
            </div>
          </div>

          {features.map((category, categoryIdx) => (
            <div key={categoryIdx}>
              <div className="px-6 py-4 bg-gray-850 border-t border-gray-700">
                <h4 className="font-semibold text-white">{category.category}</h4>
              </div>
              {category.features.map((feature, featureIdx) => (
                <div key={featureIdx} className="grid grid-cols-3 border-t border-gray-700/50">
                  <div className="p-4 px-6">
                    <span className="text-gray-300">{feature.name}</span>
                  </div>
                  <div className="p-4 text-center border-x border-gray-700/50">
                    {feature.traditional ? (
                      <Check className="w-5 h-5 text-gray-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-600 mx-auto" />
                    )}
                  </div>
                  <div className="p-4 text-center bg-gradient-to-r from-green-900/10 to-emerald-900/10">
                    <Check className="w-5 h-5 text-green-400 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div className="p-6 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-t border-green-500/20">
            <div className="grid grid-cols-3">
              <div>
                <h4 className="font-semibold text-white">Bottom Line Impact</h4>
              </div>
              <div className="text-center">
                <p className="text-gray-400">Manual processes, reactive management</p>
                <p className="text-2xl font-bold text-red-400 mt-2">-$0</p>
                <p className="text-sm text-gray-500">No efficiency gains</p>
              </div>
              <div className="text-center">
                <p className="text-green-400">Automated workflows, proactive control</p>
                <p className="text-2xl font-bold text-green-400 mt-2">+$45K</p>
                <p className="text-sm text-green-400/70">Average annual savings</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <a 
            href="/operations" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-500/25 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all"
          >
            Upgrade to Operations Center
          </a>
        </div>
      </div>
    </section>
  );
}