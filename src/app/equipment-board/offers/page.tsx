'use client';

import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Package, 
  Search, 
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Star,
  ArrowRight
} from 'lucide-react';

const sampleOffers = [
  {
    id: 1,
    title: "LED Full Spectrum Grow Lights - 1000W",
    price: "$1,200",
    location: "California, USA",
    supplier: "GrowTech Solutions",
    rating: 4.8,
    image: "/api/placeholder/300/200",
    description: "High-efficiency LED grow lights with full spectrum coverage"
  },
  {
    id: 2,
    title: "Climate Control System - Complete Setup",
    price: "$8,500",
    location: "Colorado, USA", 
    supplier: "Climate Masters",
    rating: 4.9,
    image: "/api/placeholder/300/200",
    description: "Complete HVAC system with humidity and CO2 control"
  },
  {
    id: 3,
    title: "Automated Irrigation System",
    price: "$3,200",
    location: "Oregon, USA",
    supplier: "HydroFlow Systems",
    rating: 4.7,
    image: "/api/placeholder/300/200",
    description: "Smart irrigation with nutrient dosing capabilities"
  }
];

export default function EquipmentOffersPage() {
  return (
    <>
      <MarketingNavigation />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900">
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold text-white mb-4"
              >
                Equipment
                <span className="bg-gradient-to-r from-blue-400 to-green-600 bg-clip-text text-transparent ml-3">
                  Marketplace
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-gray-300 max-w-2xl mx-auto"
              >
                Browse verified equipment offers from trusted suppliers
              </motion.p>
            </div>

            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-12"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search equipment..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Filter className="w-5 h-5" />
                  Filters
                </button>
              </div>
            </motion.div>

            {/* Equipment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {sampleOffers.map((offer, index) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500/50 transition-all duration-300"
                >
                  <div className="h-48 bg-gray-700 flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{offer.title}</h3>
                      <span className="text-xl font-bold text-green-400">{offer.price}</span>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4">{offer.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin className="w-4 h-4" />
                        {offer.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        {offer.rating} • {offer.supplier}
                      </div>
                    </div>
                    
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Contact Supplier
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-r from-blue-900/30 to-green-900/30 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30"
              >
                <h2 className="text-2xl font-bold text-white mb-4">
                  Don't see what you need?
                </h2>
                <p className="text-gray-300 mb-6">
                  Post a request and let suppliers come to you
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/equipment-board"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300"
                  >
                    Post Equipment Request
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link 
                    href="/marketplace/vendor-signup"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gray-800/50 backdrop-blur-sm text-white font-semibold rounded-lg border border-gray-600 hover:bg-gray-700/50 transition-all duration-300"
                  >
                    Become a Supplier
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </>
  );
}