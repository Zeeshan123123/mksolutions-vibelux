import React from 'react'
import { TrendingUp, Clock, Shield, Zap } from 'lucide-react'

export default function ValueProposition() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-950 to-purple-950/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Why VibeLux is Different
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We're not just another cultivation software. We're the only platform built by growers, for growers, 
            with everything you need in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h3 className="text-3xl font-bold text-white mb-6">
              Save 20-40% on Energy Costs
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <TrendingUp className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-semibold">AI-Powered Optimization</p>
                  <p className="text-gray-400">Our algorithms analyze your facility 24/7 to find savings</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-semibold">10+ Hours Saved Weekly</p>
                  <p className="text-gray-400">Automation handles billing, reports, and routine tasks</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-semibold">Enterprise Security</p>
                  <p className="text-gray-400">Bank-level encryption, automated backups, disaster recovery</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-semibold">100+ Integrations</p>
                  <p className="text-gray-400">Works with your existing tools - no data silos</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
            <h4 className="text-2xl font-bold text-white mb-6">ROI Calculator</h4>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 mb-2">Average facility size: 10,000 sq ft</p>
                <p className="text-gray-400 mb-2">Monthly energy cost: $15,000</p>
                <p className="text-gray-400 mb-2">VibeLux savings (30%): $4,500/month</p>
                <div className="border-t border-gray-800 pt-4 mt-4">
                  <p className="text-green-500 font-bold text-2xl">Annual Savings: $54,000</p>
                  <p className="text-gray-400 mt-2">VibeLux pays for itself in less than 30 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-900/20 to-green-900/20 rounded-2xl p-8 lg:p-12 border border-purple-800/50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold text-white mb-2">5,000+</p>
              <p className="text-gray-400">Active Facilities</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-white mb-2">$2.3M</p>
              <p className="text-gray-400">Saved Monthly</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-white mb-2">99.9%</p>
              <p className="text-gray-400">Uptime SLA</p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Transform Your Operation?
          </h3>
          <p className="text-gray-400 mb-8">
            Start saving time and money with VibeLux
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/sign-up" 
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-purple-600 hover:shadow-lg hover:shadow-green-500/25 text-white rounded-xl font-semibold text-lg transition-all"
            >
              Start Free 14-Day Trial
            </a>
            <a 
              href="/demo" 
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold text-lg transition-all"
            >
              Book a Demo
            </a>
          </div>
          <p className="text-gray-500 mt-4 text-sm">
            14-day free trial • Credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}