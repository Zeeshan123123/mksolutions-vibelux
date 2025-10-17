'use client';

import React, { useState } from 'react';
import { Check, X, Info } from 'lucide-react';

interface FeatureRow {
  category: string;
  feature: string;
  description?: string;
  free: string | boolean | number;
  solo: string | boolean | number;
  starter: string | boolean | number;
  teams: string | boolean | number;
  pro: string | boolean | number;
  enterprise: string | boolean | number;
}

const DETAILED_FEATURES: FeatureRow[] = [
  // Core Platform
  { category: 'Core Platform', feature: 'AI Designer Credits', description: 'Monthly AI design generation credits', free: 5, solo: 50, starter: 100, teams: 300, pro: 1000, enterprise: '3000+' },
  { category: 'Core Platform', feature: 'User Seats', description: 'Number of team members', free: 1, solo: 1, starter: 3, teams: 10, pro: 10, enterprise: '25+' },
  { category: 'Core Platform', feature: 'Facilities/Locations', description: 'Manage multiple growing facilities', free: 1, solo: 1, starter: 1, teams: 2, pro: 5, enterprise: 'Unlimited' },
  { category: 'Core Platform', feature: 'Active Projects', description: 'Concurrent project limit', free: 1, solo: 2, starter: 10, teams: 25, pro: 50, enterprise: 'Unlimited' },
  { category: 'Core Platform', feature: 'Data Retention', description: 'Historical data storage', free: '7 days', solo: '30 days', starter: '30 days', teams: '90 days', pro: '6 months', enterprise: 'Unlimited' },
  { category: 'Core Platform', feature: 'Cloud Storage', description: 'Design & document storage', free: '100 MB', solo: '5 GB', starter: '10 GB', teams: '50 GB', pro: '200 GB', enterprise: 'Unlimited' },
  
  // Design Tools
  { category: 'Design Tools', feature: 'Basic PPFD/DLI Calculator', free: true, solo: true, starter: true, teams: true, pro: true, enterprise: true },
  { category: 'Design Tools', feature: 'Advanced Light Designer', free: false, solo: 'Core', starter: 'Full', teams: 'Full', pro: 'Full', enterprise: 'Full' },
  { category: 'Design Tools', feature: '3D Visualization', free: false, solo: false, starter: true, teams: true, pro: true, enterprise: true },
  { category: 'Design Tools', feature: 'CAD Import/Export', free: false, solo: false, starter: 'DXF only', teams: 'All formats', pro: 'All formats', enterprise: 'All formats' },
  { category: 'Design Tools', feature: 'Fixture Database (2400+)', free: 'View only', solo: 'Full access', starter: 'Full access', teams: 'Full access', pro: 'Full access', enterprise: 'Full access' },
  { category: 'Design Tools', feature: 'Custom Fixture Creation', free: false, solo: false, starter: 5, teams: 25, pro: 100, enterprise: 'Unlimited' },
  { category: 'Design Tools', feature: 'Heat Map Generation', free: false, solo: true, starter: true, teams: true, pro: true, enterprise: true },
  { category: 'Design Tools', feature: 'Shadow Analysis', free: false, solo: false, starter: true, teams: true, pro: true, enterprise: true },
  
  // Calculators
  { category: 'Calculators', feature: 'Basic Calculators', description: 'PPFD, DLI, ROI basics', free: 5, solo: 25, starter: '300+', teams: '300+', pro: '300+', enterprise: '300+' },
  { category: 'Calculators', feature: 'Energy Calculators', free: false, solo: true, starter: true, teams: true, pro: true, enterprise: true },
  { category: 'Calculators', feature: 'Financial Calculators', free: false, solo: 'Basic', starter: 'Full', teams: 'Full', pro: 'Full', enterprise: 'Full' },
  { category: 'Calculators', feature: 'Environmental Calculators', free: false, solo: false, starter: true, teams: true, pro: true, enterprise: true },
  { category: 'Calculators', feature: 'Electrical Load Calculator', free: false, solo: false, starter: true, teams: true, pro: true, enterprise: true },
  { category: 'Calculators', feature: 'HVAC Sizing Calculator', free: false, solo: false, starter: true, teams: true, pro: true, enterprise: true },
  { category: 'Calculators', feature: 'Nutrient Calculator', free: false, solo: false, starter: true, teams: true, pro: true, enterprise: true },
  
  // Reporting & Analytics
  { category: 'Analytics', feature: 'Basic Reports', free: false, solo: 3, starter: 10, teams: 50, pro: 'Unlimited', enterprise: 'Unlimited' },
  { category: 'Analytics', feature: 'Custom Report Builder', free: false, solo: false, starter: false, teams: true, pro: true, enterprise: true },
  { category: 'Analytics', feature: 'Energy Analytics', free: false, solo: 'Basic', starter: 'Standard', teams: 'Advanced', pro: 'Advanced', enterprise: 'Enterprise' },
  { category: 'Analytics', feature: 'Yield Predictions', free: false, solo: false, starter: 'Basic', teams: 'ML-powered', pro: 'ML-powered', enterprise: 'ML-powered' },
  { category: 'Analytics', feature: 'Benchmark Comparisons', free: false, solo: false, starter: false, teams: true, pro: true, enterprise: true },
  { category: 'Analytics', feature: 'Real-time Dashboards', free: false, solo: false, starter: false, teams: '5 dashboards', pro: 'Unlimited', enterprise: 'Unlimited' },
  { category: 'Analytics', feature: 'Export Formats', free: 'PDF only', solo: 'PDF, CSV', starter: 'PDF, CSV, Excel', teams: 'All formats', pro: 'All formats', enterprise: 'All formats' },
  
  // Automation & Integration
  { category: 'Automation', feature: 'Workflow Automation', free: false, solo: false, starter: false, teams: '10 workflows', pro: '100 workflows', enterprise: 'Unlimited' },
  { category: 'Automation', feature: 'API Access', free: false, solo: false, starter: false, teams: false, pro: '10k calls/mo', enterprise: 'Unlimited' },
  { category: 'Automation', feature: 'Webhooks', free: false, solo: false, starter: false, teams: 5, pro: 50, enterprise: 'Unlimited' },
  { category: 'Automation', feature: 'BMS Integration', free: false, solo: false, starter: false, teams: 'Read only', pro: 'Full control', enterprise: 'Full control' },
  { category: 'Automation', feature: 'Sensor Integration', free: false, solo: false, starter: false, teams: false, pro: '100 sensors', enterprise: 'Unlimited' },
  { category: 'Automation', feature: 'Schedule Automation', free: false, solo: false, starter: 'Basic', teams: 'Advanced', pro: 'Advanced', enterprise: 'Advanced' },
  { category: 'Automation', feature: 'Alert Rules', free: false, solo: 5, starter: 20, teams: 50, pro: 200, enterprise: 'Unlimited' },
  
  // AI & Machine Learning
  { category: 'AI Features', feature: 'AI Design Assistant', free: 'Basic', solo: 'Standard', starter: 'Advanced', teams: 'Advanced', pro: 'Premium', enterprise: 'Premium' },
  { category: 'AI Features', feature: 'Plant Health AI (Beta)', description: 'Disease detection & diagnosis', free: false, solo: false, starter: '$29 add-on', teams: '$29 add-on', pro: 'Included', enterprise: 'Included' },
  { category: 'AI Features', feature: 'Pest Identification', free: false, solo: false, starter: false, teams: '$29 add-on', pro: 'Included', enterprise: 'Included' },
  { category: 'AI Features', feature: 'Growth Predictions', free: false, solo: false, starter: false, teams: 'Basic', pro: 'Advanced', enterprise: 'Advanced' },
  { category: 'AI Features', feature: 'Recipe Optimization', free: false, solo: false, starter: false, teams: false, pro: true, enterprise: true },
  { category: 'AI Features', feature: 'Computer Vision', free: false, solo: false, starter: false, teams: false, pro: '1000 images/mo', enterprise: 'Unlimited' },
  
  // Marketplace & Commerce
  { category: 'Marketplace', feature: 'Marketplace Access', description: 'Buy from marketplace', free: true, solo: true, starter: true, teams: true, pro: true, enterprise: true },
  { category: 'Marketplace', feature: 'Seller Account', description: 'Sell on marketplace', free: false, solo: false, starter: false, teams: true, pro: true, enterprise: true },
  { category: 'Marketplace', feature: 'Recipe Licensing', free: false, solo: false, starter: false, teams: 'Buy only', pro: 'Buy & Sell', enterprise: 'Buy & Sell' },
  { category: 'Marketplace', feature: 'Transaction Fees', free: 'N/A', solo: 'N/A', starter: 'N/A', teams: '10%', pro: '7%', enterprise: '5%' },
  { category: 'Marketplace', feature: 'Featured Listings', free: false, solo: false, starter: false, teams: false, pro: 5, enterprise: 'Unlimited' },
  { category: 'Marketplace', feature: 'Bulk Import/Export', free: false, solo: false, starter: false, teams: false, pro: true, enterprise: true },
  
  // Collaboration
  { category: 'Collaboration', feature: 'Team Sharing', free: false, solo: false, starter: true, teams: true, pro: true, enterprise: true },
  { category: 'Collaboration', feature: 'Comments & Annotations', free: false, solo: false, starter: true, teams: true, pro: true, enterprise: true },
  { category: 'Collaboration', feature: 'Version Control', free: false, solo: 'Last 5', starter: 'Last 20', teams: 'Last 100', pro: 'Unlimited', enterprise: 'Unlimited' },
  { category: 'Collaboration', feature: 'Guest Access', free: false, solo: false, starter: 2, teams: 10, pro: 50, enterprise: 'Unlimited' },
  { category: 'Collaboration', feature: 'Role-based Permissions', free: false, solo: false, starter: false, teams: true, pro: true, enterprise: true },
  { category: 'Collaboration', feature: 'Audit Logs', free: false, solo: false, starter: false, teams: '30 days', pro: '1 year', enterprise: 'Unlimited' },
  
  // Support & Training
  { category: 'Support', feature: 'Community Support', free: true, solo: true, starter: true, teams: true, pro: true, enterprise: true },
  { category: 'Support', feature: 'Email Support', free: false, solo: '48hr response', starter: '24hr response', teams: '12hr response', pro: '4hr response', enterprise: '1hr response' },
  { category: 'Support', feature: 'Live Chat', free: false, solo: false, starter: false, teams: 'Business hours', pro: '24/5', enterprise: '24/7' },
  { category: 'Support', feature: 'Phone Support', free: false, solo: false, starter: false, teams: false, pro: true, enterprise: true },
  { category: 'Support', feature: 'Dedicated Account Manager', free: false, solo: false, starter: false, teams: false, pro: false, enterprise: true },
  { category: 'Support', feature: 'Training Sessions', free: false, solo: false, starter: '1 session', teams: '4 sessions', pro: '12 sessions', enterprise: 'Unlimited' },
  { category: 'Support', feature: 'Custom Onboarding', free: false, solo: false, starter: false, teams: false, pro: true, enterprise: true },
  { category: 'Support', feature: 'SLA Guarantee', free: false, solo: false, starter: false, teams: false, pro: '99.5%', enterprise: '99.9%' },
  
  // Compliance & Security
  { category: 'Compliance', feature: 'SSL Encryption', free: true, solo: true, starter: true, teams: true, pro: true, enterprise: true },
  { category: 'Compliance', feature: 'Data Backup', free: 'Daily', solo: 'Daily', starter: 'Daily', teams: 'Hourly', pro: 'Real-time', enterprise: 'Real-time' },
  { category: 'Compliance', feature: 'GDPR Compliance', free: true, solo: true, starter: true, teams: true, pro: true, enterprise: true },
  { category: 'Compliance', feature: 'SOC 2 Compliance', free: false, solo: false, starter: false, teams: false, pro: false, enterprise: true },
  { category: 'Compliance', feature: 'HIPAA Compliance', free: false, solo: false, starter: false, teams: false, pro: false, enterprise: 'Available' },
  { category: 'Compliance', feature: 'Custom Data Residency', free: false, solo: false, starter: false, teams: false, pro: false, enterprise: true },
  { category: 'Compliance', feature: 'SSO/SAML', free: false, solo: false, starter: false, teams: false, pro: false, enterprise: true },
  { category: 'Compliance', feature: '2FA Required', free: false, solo: false, starter: false, teams: 'Optional', pro: 'Required', enterprise: 'Required' },
];

export function DetailedPricingComparison() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Core Platform', 'Design Tools']);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const categories = [...new Set(DETAILED_FEATURES.map(f => f.category))];

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const renderValue = (value: string | boolean | number) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-400 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-gray-600 mx-auto" />
      );
    }
    
    if (typeof value === 'number') {
      return <span className="text-white font-medium">{value.toLocaleString()}</span>;
    }
    
    if (value === 'N/A' || value === false) {
      return <span className="text-gray-600">—</span>;
    }
    
    return <span className="text-gray-200">{value}</span>;
  };

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-2">Complete Feature Comparison</h2>
        <p className="text-gray-400">Detailed breakdown of all features across every plan</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800 sticky top-0 z-10">
            <tr>
              <th className="text-left p-4 text-gray-400 font-medium min-w-[250px]">Feature</th>
              <th className="p-4 text-center">
                <div className="text-white font-semibold">Free</div>
                <div className="text-gray-400 text-sm">$0/mo</div>
              </th>
              <th className="p-4 text-center">
                <div className="text-white font-semibold">Solo</div>
                <div className="text-gray-400 text-sm">$29/mo</div>
              </th>
              <th className="p-4 text-center">
                <div className="text-white font-semibold">Starter</div>
                <div className="text-gray-400 text-sm">$49/mo</div>
              </th>
              <th className="p-4 text-center bg-purple-900/20">
                <div className="text-white font-semibold">Teams</div>
                <div className="text-purple-400 text-sm">$99/mo</div>
                <div className="text-xs text-purple-400 mt-1">POPULAR</div>
              </th>
              <th className="p-4 text-center">
                <div className="text-white font-semibold">Pro</div>
                <div className="text-gray-400 text-sm">$199/mo</div>
              </th>
              <th className="p-4 text-center">
                <div className="text-white font-semibold">Enterprise</div>
                <div className="text-gray-400 text-sm">$499/mo</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => {
              const categoryFeatures = DETAILED_FEATURES.filter(f => f.category === category);
              const isExpanded = expandedCategories.includes(category);
              
              return (
                <React.Fragment key={category}>
                  <tr 
                    className="bg-gray-800/50 cursor-pointer hover:bg-gray-800/70 transition-colors"
                    onClick={() => toggleCategory(category)}
                  >
                    <td colSpan={7} className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{category}</span>
                        <span className="text-gray-400 text-sm">
                          {isExpanded ? '−' : '+'} {categoryFeatures.length} features
                        </span>
                      </div>
                    </td>
                  </tr>
                  
                  {isExpanded && categoryFeatures.map((feature, idx) => (
                    <tr key={`${category}-${idx}`} className="border-t border-gray-800/50 hover:bg-gray-800/20">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300">{feature.feature}</span>
                          {feature.description && (
                            <div className="relative">
                              <Info
                                className="w-4 h-4 text-gray-500 cursor-help"
                                onMouseEnter={() => setShowTooltip(`${category}-${idx}`)}
                                onMouseLeave={() => setShowTooltip(null)}
                              />
                              {showTooltip === `${category}-${idx}` && (
                                <div className="absolute left-6 top-0 bg-gray-700 text-white text-xs rounded p-2 w-48 z-20">
                                  {feature.description}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">{renderValue(feature.free)}</td>
                      <td className="p-4 text-center">{renderValue(feature.solo)}</td>
                      <td className="p-4 text-center">{renderValue(feature.starter)}</td>
                      <td className="p-4 text-center bg-purple-900/10">{renderValue(feature.teams)}</td>
                      <td className="p-4 text-center">{renderValue(feature.pro)}</td>
                      <td className="p-4 text-center">{renderValue(feature.enterprise)}</td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-gray-800 bg-gray-800/50">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-white mb-2">Need More?</h3>
            <p className="text-sm text-gray-400 mb-3">
              Enterprise plans can be customized to your exact needs
            </p>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
              Contact Sales →
            </button>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-2">Energy Savings Program</h3>
            <p className="text-sm text-gray-400 mb-3">
              $0 upfront • We optimize, you save • 25% revenue share
            </p>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
              Learn More →
            </button>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-2">Volume Discounts</h3>
            <p className="text-sm text-gray-400 mb-3">
              Save up to 30% with annual billing or multi-facility plans
            </p>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
              Get Quote →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailedPricingComparison;