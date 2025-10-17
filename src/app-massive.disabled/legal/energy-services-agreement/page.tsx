'use client';

import { Shield, FileText, DollarSign, Zap, AlertCircle, Clock, CheckCircle } from 'lucide-react';

export default function EnergyServicesAgreementPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Transparent Terms</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            VibeLux Energy Services Agreement
          </h1>
          <p className="text-xl text-gray-400">
            Clear, fair terms for our energy optimization partnership
          </p>
        </div>

        {/* Key Terms Summary */}
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-green-400" />
            Agreement Summary
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white">Revenue Share: 70/30</h3>
                  <p className="text-gray-400 text-sm">You keep 70% of verified energy savings, VibeLux takes 30%</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white">No Upfront Costs</h3>
                  <p className="text-gray-400 text-sm">Zero equipment or installation fees. Pay only from savings.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white">Crop Protection Guarantee</h3>
                  <p className="text-gray-400 text-sm">100% guarantee that optimization never harms your crop</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white">Flexible Terms</h3>
                  <p className="text-gray-400 text-sm">Cancel anytime with 30-day notice. No long-term lock-in.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white">Performance Guarantee</h3>
                  <p className="text-gray-400 text-sm">Minimum 15% energy savings or service is free</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white">Third-Party Verification</h3>
                  <p className="text-gray-400 text-sm">Independent utility bill analysis ensures fair calculations</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Terms */}
        <div className="space-y-8">
          {/* Service Description */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">1. Service Description</h3>
            <div className="space-y-3 text-gray-300">
              <p>
                VibeLux provides AI-powered energy optimization services for cannabis cultivation facilities 
                through intelligent control of lighting, HVAC, and auxiliary equipment systems.
              </p>
              <p className="font-medium text-white">Services Include:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-400 ml-4">
                <li>Real-time energy monitoring and optimization</li>
                <li>Weather-adaptive scheduling and controls</li>
                <li>Peak demand management and load shifting</li>
                <li>Utility demand response program participation</li>
                <li>Environmental condition maintenance within specified parameters</li>
                <li>24/7 system monitoring and emergency response</li>
              </ul>
            </div>
          </div>

          {/* Revenue Sharing Model */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">2. Revenue Sharing Model</h3>
            <div className="space-y-4 text-gray-300">
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Savings Calculation Method:</h4>
                <ol className="list-decimal list-inside space-y-1 text-gray-400">
                  <li>Baseline energy consumption established from 12 months of historical utility bills</li>
                  <li>Weather normalization applied using degree-day adjustments</li>
                  <li>Monthly savings = (Weather-adjusted baseline - Actual consumption) × Utility rate</li>
                  <li>Third-party verification through utility bill analysis</li>
                </ol>
              </div>
              <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-green-300 mb-2">Revenue Split:</h4>
                <ul className="space-y-1 text-gray-300">
                  <li>• Customer retains: <span className="text-green-400 font-bold">70%</span> of verified savings</li>
                  <li>• VibeLux receives: <span className="text-blue-400 font-bold">30%</span> of verified savings</li>
                  <li>• Minimum monthly payment: <span className="text-white font-bold">$0</span> (pay only from savings)</li>
                  <li>• Payment due: Within 15 days of utility bill receipt</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Performance Guarantees */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">3. Performance Guarantees</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Energy Savings Guarantee:</h4>
                <ul className="space-y-1 text-gray-400 text-sm">
                  <li>• Minimum 15% energy cost reduction within 90 days</li>
                  <li>• Target 20-40% reduction within 12 months</li>
                  <li>• If minimum not achieved, service provided free until met</li>
                  <li>• Weather-normalized calculations ensure fair measurement</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Crop Protection Guarantee:</h4>
                <ul className="space-y-1 text-gray-400 text-sm">
                  <li>• No interruption of critical photoperiods</li>
                  <li>• VPD maintained within ±10% of target ranges</li>
                  <li>• CO₂ enrichment schedules protected</li>
                  <li>• Emergency override always available to customer</li>
                  <li>• $100,000 crop loss insurance coverage</li>
                </ul>
              </div>
            </div>
          </div>

          {/* System Requirements */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">4. Technical Requirements</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Customer Responsibilities:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-400 text-sm ml-4">
                  <li>Provide access to electrical panels and control systems</li>
                  <li>Maintain internet connectivity to VibeLux monitoring systems</li>
                  <li>Notify VibeLux of any operational changes affecting energy use</li>
                  <li>Provide monthly utility bills within 5 days of receipt</li>
                  <li>Allow VibeLux personnel reasonable access for maintenance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">VibeLux Responsibilities:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-400 text-sm ml-4">
                  <li>Install and maintain all monitoring equipment at no cost</li>
                  <li>Provide 24/7 system monitoring and emergency response</li>
                  <li>Maintain all software and AI optimization algorithms</li>
                  <li>Provide monthly savings reports with detailed calculations</li>
                  <li>Ensure all optimizations comply with local regulations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Termination Clauses */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">5. Termination & Exit Terms</h3>
            <div className="space-y-3 text-gray-300">
              <p>
                <span className="font-semibold text-white">Flexible Termination:</span> Either party may terminate 
                this agreement with 30 days written notice. No penalties or early termination fees.
              </p>
              <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-300 mb-2">Upon Termination:</h4>
                <ul className="space-y-1 text-gray-300 text-sm">
                  <li>• Customer retains ownership of all installed equipment</li>
                  <li>• VibeLux provides 30-day transition period for smooth handover</li>
                  <li>• Final savings calculation performed by independent third party</li>
                  <li>• All monitoring data provided to customer in standard format</li>
                  <li>• No ongoing obligations except final payment of accrued savings share</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Insurance and Liability */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">6. Insurance & Liability</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-2">VibeLux Coverage:</h4>
                <ul className="space-y-1 text-gray-400 text-sm">
                  <li>• $5M General Liability Insurance</li>
                  <li>• $2M Professional Liability Insurance</li>
                  <li>• $100K Crop Loss Protection per incident</li>
                  <li>• Equipment damage coverage up to $50K</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Liability Limitations:</h4>
                <ul className="space-y-1 text-gray-400 text-sm">
                  <li>• Force majeure events (natural disasters, utility outages)</li>
                  <li>• Customer modifications to VibeLux systems</li>
                  <li>• Third-party interference or cyber attacks</li>
                  <li>• Regulatory changes affecting operations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-green-800/50">
            <h3 className="text-xl font-bold text-white mb-4">Questions About This Agreement?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-2">Legal Questions:</h4>
                <p className="text-gray-300 text-sm">
                  Email: legal@vibelux.ai<br />
                  Phone: 1-800-VIBELUX<br />
                  Available: Mon-Fri 9AM-6PM PST
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Technical Questions:</h4>
                <p className="text-gray-300 text-sm">
                  Email: support@vibelux.ai<br />
                  Phone: 1-800-VIBELUX<br />
                  Available: 24/7 Emergency Support
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}