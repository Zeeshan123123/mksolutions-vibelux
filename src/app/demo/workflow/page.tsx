'use client';

import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, CheckCircle } from 'lucide-react';

export default function WorkflowDemoPage() {
  return (
    <>
      <MarketingNavigation />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900">
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Workflow Automation
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-green-600 bg-clip-text text-transparent">
                Interactive Demo
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-300 mb-8"
            >
              Experience how VibeLux automates your entire cultivation workflow from seed to sale
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link 
                href="/demo/workflow-automation"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-300"
              >
                <Play className="w-5 h-5" />
                View Workflow Automation Demo
              </Link>
              <Link 
                href="/get-started"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-800/50 backdrop-blur-sm text-white font-semibold rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-all duration-300"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-gray-800/50 rounded-lg p-6">
                <CheckCircle className="w-8 h-8 text-green-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Smart Automation</h3>
                <p className="text-gray-300">See how AI automates climate control, irrigation, and equipment management</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6">
                <CheckCircle className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Real-time Intelligence</h3>
                <p className="text-gray-300">Experience hybrid ML providing instant feedback and platform insights</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6">
                <CheckCircle className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Zero-Cost APIs</h3>
                <p className="text-gray-300">Discover $500K+ value from optimized integrations</p>
                <Link 
                  href="/demo/zero-cost-api" 
                  className="mt-3 inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 text-sm font-medium"
                >
                  View Demo <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </>
  );
}