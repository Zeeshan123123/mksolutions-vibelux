'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface PressItem {
  name: string;
  logo: string;
  url?: string;
  quote?: string;
}

const pressMentions: PressItem[] = [
  {
    name: 'Greenhouse Product News',
    logo: '/press/gpn-logo.svg',
    url: 'https://www.greenhousegrower.com',
    quote: '40 Under 40 Award Winner - Shaping the Future of Horticulture',
  },
  {
    name: 'University of Arizona',
    logo: '/press/ua-logo.svg',
    url: 'https://www.arizona.edu',
    quote: 'Pioneering LED Systems for Space Agriculture Research',
  },
  {
    name: 'Global CEA Consortium',
    logo: '/press/gceac-logo.svg',
    url: 'https://www.globalcea.org',
  },
  {
    name: 'Resource Innovation Institute',
    logo: '/press/rii-logo.svg',
    url: 'https://www.resourceinnovation.org',
  },
  {
    name: 'USDA',
    logo: '/press/usda-logo.svg',
    url: 'https://www.usda.gov',
    quote: 'Contributing to Specialty Crop Research Initiative',
  },
  {
    name: 'Acuity Brands',
    logo: '/press/acuity-logo.svg',
    url: 'https://www.acuitybrands.com',
  },
];

export function PressMentions() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-white mb-4"
          >
            Recognition & Partnerships
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400"
          >
            Trusted by industry leaders and academic institutions
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {pressMentions.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="h-20 flex items-center justify-center p-4 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all">
                    <div className="bg-white/10 p-4 rounded-lg">
                      <span className="text-gray-400 text-sm font-medium">{item.name}</span>
                    </div>
                  </div>
                </a>
              ) : (
                <div className="h-20 flex items-center justify-center p-4 grayscale opacity-60">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <span className="text-gray-400 text-sm font-medium">{item.name}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Featured Press Quotes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 grid md:grid-cols-2 gap-8"
        >
          {pressMentions.filter(item => item.quote).map((item, index) => (
            <div
              key={item.name}
              className="bg-white/5 backdrop-blur p-6 rounded-2xl border border-white/10"
            >
              <p className="text-gray-300 italic mb-4">"{item.quote}"</p>
              <p className="text-purple-400 font-medium">- {item.name}</p>
            </div>
          ))}
        </motion.div>

        {/* Media Kit CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400 mb-4">For media inquiries and press kit</p>
          <a
            href="/press"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            Visit Press Center
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}