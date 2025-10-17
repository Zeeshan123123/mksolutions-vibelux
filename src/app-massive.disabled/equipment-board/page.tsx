'use client';

import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Package, 
  TrendingUp, 
  Shield, 
  Clock,
  DollarSign,
  Users,
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';

export default function EquipmentBoardPage() {
  return (
    <>
      <MarketingNavigation />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900">
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-6xl font-bold text-white mb-6"
              >
                Equipment Request
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-green-600 bg-clip-text text-transparent">
                  Board
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-gray-300 max-w-3xl mx-auto mb-8"
              >
                Connect buyers and sellers in the cultivation equipment marketplace. 
                Post equipment requests, browse offers, and find verified suppliers.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link 
                  href="/equipment-board/offers"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-300"
                >
                  Browse Equipment
                  <Search className="w-5 h-5" />
                </Link>
                <Link 
                  href="/marketplace"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gray-800/50 backdrop-blur-sm text-white font-semibold rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-all duration-300"
                >
                  Post Request
                  <Package className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700"
              >
                <Package className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Equipment Requests</h3>
                <p className="text-gray-300 mb-4">
                  Post specific equipment needs and receive quotes from verified suppliers
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• LED lighting systems</li>
                  <li>• Climate control equipment</li>
                  <li>• Irrigation and fertigation</li>
                  <li>• Processing and packaging</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700"
              >
                <Shield className="w-12 h-12 text-green-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Verified Suppliers</h3>
                <p className="text-gray-300 mb-4">
                  Connect with pre-vetted equipment suppliers and service providers
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Background verification</li>
                  <li>• Customer reviews & ratings</li>
                  <li>• Insurance & warranty info</li>
                  <li>• Response time tracking</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700"
              >
                <TrendingUp className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Market Intelligence</h3>
                <p className="text-gray-300 mb-4">
                  Access real-time pricing data and market trends
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Equipment pricing trends</li>
                  <li>• Availability forecasting</li>
                  <li>• Supplier performance metrics</li>
                  <li>• ROI analysis tools</li>
                </ul>
              </motion.div>
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-8">Ready to Connect?</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/equipment-board/offers"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300"
                >
                  View Available Equipment
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/marketplace/vendor-signup" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300"
                >
                  Become a Supplier
                  <Users className="w-5 h-5" />
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