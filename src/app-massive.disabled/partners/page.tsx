'use client';

import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { 
  Handshake, Globe, Zap, Users, Award, 
  ArrowRight, Building, Rocket, Shield 
} from 'lucide-react';

const partnerTypes = [
  {
    title: 'Technology Partners',
    description: 'Integrate your hardware and software with the VibeLux platform',
    icon: Zap,
    benefits: [
      'API access and documentation',
      'Co-marketing opportunities',
      'Technical support',
      'Revenue sharing'
    ]
  },
  {
    title: 'Channel Partners',
    description: 'Resell VibeLux solutions to your customer base',
    icon: Globe,
    benefits: [
      'Partner portal access',
      'Sales enablement tools',
      'Commission structure',
      'Lead sharing'
    ]
  },
  {
    title: 'Consulting Partners',
    description: 'Deliver VibeLux implementations to growers',
    icon: Users,
    benefits: [
      'Certification program',
      'Project support',
      'Priority access',
      'Partner rates'
    ]
  }
];

export default function PartnersPage() {
  return (
    <>
      <MarketingNavigation />
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-purple-900/20 to-gray-950 py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600/20 rounded-full mb-6">
              <Handshake className="w-10 h-10 text-purple-400" />
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Partner with VibeLux
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join our ecosystem of technology providers, consultants, and channel partners 
              transforming controlled environment agriculture.
            </p>
          </div>
        </div>

        {/* Partner Types */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            {partnerTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.title} className="bg-gray-900 rounded-xl p-8 border border-gray-800">
                  <div className="inline-flex p-3 bg-purple-600/10 rounded-lg mb-6">
                    <Icon className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{type.title}</h3>
                  <p className="text-gray-400 mb-6">{type.description}</p>
                  <ul className="space-y-3">
                    {type.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2" />
                        <span className="text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Partners */}
        <div className="bg-gray-900/50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">
              Growing Together
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white">15+</p>
                <p className="text-gray-400">Technology Partners</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <Globe className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white">8</p>
                <p className="text-gray-400">Countries</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white">50+</p>
                <p className="text-gray-400">Certified Consultants</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-gray-400">Joint Customers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Partner Benefits */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl p-12 border border-purple-800/30">
            <h2 className="text-3xl font-bold mb-8">Why Partner with VibeLux?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-purple-400">Business Growth</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Rocket className="w-5 h-5 text-purple-400 mt-0.5" />
                    <span className="text-gray-300">Access to rapidly growing market</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Rocket className="w-5 h-5 text-purple-400 mt-0.5" />
                    <span className="text-gray-300">Revenue sharing opportunities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Rocket className="w-5 h-5 text-purple-400 mt-0.5" />
                    <span className="text-gray-300">Co-marketing and lead generation</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-purple-400">Technical Excellence</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-purple-400 mt-0.5" />
                    <span className="text-gray-300">Industry-leading platform</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-purple-400 mt-0.5" />
                    <span className="text-gray-300">Comprehensive API documentation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-purple-400 mt-0.5" />
                    <span className="text-gray-300">Dedicated technical support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Grow Together?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Let's discuss how we can create value for growers together.
            </p>
            <Link
              href="/contact?type=partnership"
              className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
            >
              Become a Partner
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}