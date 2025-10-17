'use client';

import React from 'react';
import { Check, X, Info } from 'lucide-react';

const FEATURE_GROUPS = [
  {
    name: 'Core Features',
    features: [
      { name: 'PPFD & DLI Calculators', free: true, grower: true, pro: true, business: true },
      { name: 'Heat Map Visualization', free: false, grower: true, pro: true, business: true },
      { name: '3D Design Studio', free: false, grower: true, pro: true, business: true },
      { name: 'Fixture Library Access', free: '50', grower: '500+', pro: 'All', business: 'All' },
      { name: 'Environmental Monitoring', free: false, grower: true, pro: true, business: true },
      { name: 'Mobile App Access', free: false, grower: true, pro: true, business: true },
    ]
  },
  {
    name: 'Advanced Analytics',
    features: [
      { name: 'AI-Powered Optimization', free: false, grower: false, pro: true, business: true },
      { name: 'Predictive Maintenance', free: false, grower: false, pro: true, business: true },
      { name: 'Energy Usage Analytics', free: 'Basic', grower: 'Advanced', pro: 'AI-Enhanced', business: 'Enterprise' },
      { name: 'Yield Predictions', free: false, grower: false, pro: true, business: true },
      { name: 'ROI Tracking', free: false, grower: 'Basic', pro: 'Advanced', business: 'Enterprise' },
      { name: 'Custom Reports', free: false, grower: false, pro: true, business: true },
    ]
  },
  {
    name: 'Collaboration & Support',
    features: [
      { name: 'Team Members', free: '1', grower: '3', pro: '10', business: 'Unlimited' },
      { name: 'Projects', free: '1', grower: '10', pro: '50', business: 'Unlimited' },
      { name: 'Data Retention', free: '7 days', grower: '90 days', pro: '1 year', business: 'Unlimited' },
      { name: 'API Access', free: false, grower: '1k/mo', pro: '100k/mo', business: 'Unlimited' },
      { name: 'Support Level', free: 'Community', grower: 'Email (24hr)', pro: 'Priority (4hr)', business: 'Dedicated' },
      { name: 'Training & Onboarding', free: 'Self-serve', grower: 'Videos', pro: '1-on-1 Session', business: 'Custom' },
    ]
  },
  {
    name: 'Enterprise Features',
    features: [
      { name: 'Multi-Facility Management', free: false, grower: false, pro: false, business: true },
      { name: 'White Label Options', free: false, grower: false, pro: false, business: true },
      { name: 'Custom Integrations', free: false, grower: false, pro: false, business: true },
      { name: 'On-Premise Deployment', free: false, grower: false, pro: false, business: true },
      { name: 'SLA Guarantee', free: false, grower: false, pro: false, business: true },
      { name: 'Compliance Tools', free: false, grower: false, pro: 'Basic', business: 'Advanced' },
    ]
  }
];

export function FeatureComparisonTable() {
  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-400 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-gray-600 mx-auto" />
      );
    }
    return <span className="text-sm text-gray-300">{value}</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-4 px-4 text-gray-400 font-medium">Features</th>
            <th className="text-center py-4 px-4">
              <div className="text-white font-semibold">Free</div>
              <div className="text-gray-400 text-sm">$0/mo</div>
            </th>
            <th className="text-center py-4 px-4">
              <div className="text-white font-semibold">Grower</div>
              <div className="text-gray-400 text-sm">$29/mo</div>
            </th>
            <th className="text-center py-4 px-4 bg-blue-900/10">
              <div className="text-white font-semibold">Professional</div>
              <div className="text-gray-400 text-sm">$99/mo</div>
              <div className="text-xs text-blue-400 mt-1">Most Popular</div>
            </th>
            <th className="text-center py-4 px-4">
              <div className="text-white font-semibold">Business</div>
              <div className="text-gray-400 text-sm">$299/mo</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {FEATURE_GROUPS.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              <tr>
                <td colSpan={5} className="pt-8 pb-4">
                  <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                </td>
              </tr>
              {group.features.map((feature, featureIndex) => (
                <tr key={featureIndex} className="border-b border-gray-800">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300">{feature.name}</span>
                      {feature.name.includes('AI') && (
                        <div className="group relative">
                          <Info className="w-4 h-4 text-gray-500" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                            <div className="bg-gray-800 text-xs text-gray-300 rounded-lg p-2 whitespace-nowrap">
                              Powered by advanced machine learning
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">{renderFeatureValue(feature.free)}</td>
                  <td className="py-3 px-4 text-center">{renderFeatureValue(feature.grower)}</td>
                  <td className="py-3 px-4 text-center bg-blue-900/10">{renderFeatureValue(feature.pro)}</td>
                  <td className="py-3 px-4 text-center">{renderFeatureValue(feature.business)}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}