'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Youtube, Linkedin, Instagram, Calendar, MessageCircle } from 'lucide-react';

export function CallToAction() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20" />
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
            backgroundSize: '200% 200%',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Join the Agricultural Revolution
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Connect with Blake and the VibeLux community to stay at the forefront of horticultural innovation
          </motion.p>
        </div>

        {/* Main CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Link 
            href="/pricing" 
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/demo" 
            className="group inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all"
          >
            <Calendar className="w-5 h-5" />
            Schedule a Demo
          </Link>
        </motion.div>

        {/* Social Follow Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur rounded-3xl p-8 md:p-12 border border-white/10 max-w-4xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Follow Blake's Journey
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* YouTube */}
            <motion.a
              href="https://www.youtube.com/@hortlightguy"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group bg-red-600/10 border border-red-600/20 rounded-2xl p-6 text-center hover:bg-red-600/20 transition-all"
            >
              <Youtube className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-1">YouTube</h4>
              <p className="text-gray-400 text-sm mb-3">@hortlightguy</p>
              <p className="text-red-400 text-sm group-hover:text-red-300 transition-colors">
                Watch tutorials & insights →
              </p>
            </motion.a>

            {/* LinkedIn */}
            <motion.a
              href="https://www.linkedin.com/in/blakelange/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group bg-blue-600/10 border border-blue-600/20 rounded-2xl p-6 text-center hover:bg-blue-600/20 transition-all"
            >
              <Linkedin className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-1">LinkedIn</h4>
              <p className="text-gray-400 text-sm mb-3">Blake Lange</p>
              <p className="text-blue-400 text-sm group-hover:text-blue-300 transition-colors">
                Connect professionally →
              </p>
            </motion.a>

            {/* Instagram */}
            <motion.a
              href="https://www.instagram.com/hortlightguy"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group bg-purple-600/10 border border-purple-600/20 rounded-2xl p-6 text-center hover:bg-purple-600/20 transition-all"
            >
              <Instagram className="w-12 h-12 text-purple-500 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-1">Instagram</h4>
              <p className="text-gray-400 text-sm mb-3">@hortlightguy</p>
              <p className="text-purple-400 text-sm group-hover:text-purple-300 transition-colors">
                See behind the scenes →
              </p>
            </motion.a>
          </div>

          {/* Newsletter Signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-2xl p-6"
          >
            <h4 className="text-lg font-semibold text-white mb-3 text-center">
              Get Monthly Insights
            </h4>
            <p className="text-gray-400 text-sm text-center mb-4">
              Join 5,000+ growers receiving Blake's monthly newsletter on lighting innovations
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm"
        >
          <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
            Contact Us
          </Link>
          <span className="text-gray-600">•</span>
          <Link href="/careers" className="text-gray-400 hover:text-white transition-colors">
            Join Our Team
          </Link>
          <span className="text-gray-600">•</span>
          <Link href="/partners" className="text-gray-400 hover:text-white transition-colors">
            Become a Partner
          </Link>
          <span className="text-gray-600">•</span>
          <Link href="/press" className="text-gray-400 hover:text-white transition-colors">
            Press Kit
          </Link>
        </motion.div>
      </div>
    </section>
  );
}