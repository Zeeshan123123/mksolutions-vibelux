'use client';

import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { 
  Briefcase, MapPin, Clock, DollarSign, ArrowRight,
  Code, Palette, BarChart3, Users, Heart, Rocket,
  Globe, Shield, Zap, Leaf
} from 'lucide-react';

interface JobPosition {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary?: string;
  description: string;
  requirements: string[];
  icon: any;
}

const openPositions: JobPosition[] = [
  {
    id: 'senior-frontend',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote (US)',
    type: 'Full-time',
    experience: '5+ years',
    salary: '$140k - $180k',
    description: 'Help build the future of agricultural technology with React, Next.js, and Three.js.',
    requirements: [
      'Expert in React and Next.js',
      'Experience with 3D graphics (Three.js)',
      'Strong TypeScript skills',
      'Experience with real-time applications'
    ],
    icon: Code
  },
  {
    id: 'ml-engineer',
    title: 'Machine Learning Engineer',
    department: 'AI/ML',
    location: 'Remote (Global)',
    type: 'Full-time',
    experience: '3+ years',
    salary: '$130k - $170k',
    description: 'Develop predictive models for crop yield, disease detection, and resource optimization.',
    requirements: [
      'Experience with PyTorch or TensorFlow',
      'Computer vision expertise',
      'Time series analysis',
      'Agricultural domain knowledge a plus'
    ],
    icon: BarChart3
  },
  {
    id: 'product-designer',
    title: 'Senior Product Designer',
    department: 'Design',
    location: 'Remote (US)',
    type: 'Full-time',
    experience: '4+ years',
    description: 'Create intuitive interfaces for complex agricultural data and controls.',
    requirements: [
      'Strong portfolio of SaaS products',
      'Experience with data visualization',
      'Proficiency in Figma',
      'Understanding of technical constraints'
    ],
    icon: Palette
  }
];

const benefits = [
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: '100% coverage for you and family, including dental and vision'
  },
  {
    icon: Globe,
    title: 'Remote First',
    description: 'Work from anywhere with flexible hours and async communication'
  },
  {
    icon: Rocket,
    title: 'Growth & Learning',
    description: '$2,000 annual learning budget and conference attendance'
  },
  {
    icon: DollarSign,
    title: 'Equity & Compensation',
    description: 'Competitive salary, equity options, and annual bonuses'
  },
  {
    icon: Users,
    title: 'Team Culture',
    description: 'Annual retreats, monthly virtual socials, and collaborative environment'
  },
  {
    icon: Leaf,
    title: 'Mission Driven',
    description: 'Make a real impact on sustainable agriculture and food security'
  }
];

export default function CareersPage() {
  return (
    <>
      <MarketingNavigation />
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-purple-900/20 to-gray-950 py-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 rounded-full border border-purple-700/50 mb-6">
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-200">We're Hiring</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-6">Join Our Mission</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Help us revolutionize agriculture through technology. We're building the tools 
              that will feed the world sustainably.
            </p>
          </div>
        </div>

        {/* Company Values */}
        <div className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why VibeLux?</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="inline-flex p-4 bg-purple-600/10 rounded-xl mb-4">
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Innovation First</h3>
                <p className="text-gray-400">
                  Push boundaries with cutting-edge tech in AI, IoT, and 3D visualization
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex p-4 bg-green-600/10 rounded-xl mb-4">
                  <Leaf className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Global Impact</h3>
                <p className="text-gray-400">
                  Your code helps feed millions while protecting our planet
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex p-4 bg-blue-600/10 rounded-xl mb-4">
                  <Shield className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Work-Life Balance</h3>
                <p className="text-gray-400">
                  Flexible hours, unlimited PTO, and a truly remote-first culture
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Open Positions */}
        <div className="py-16 px-6 bg-gray-900/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Open Positions</h2>
            
            {openPositions.length > 0 ? (
              <div className="space-y-6">
                {openPositions.map((position) => {
                  const Icon = position.icon;
                  return (
                    <Link
                      key={position.id}
                      href={`/careers/${position.id}`}
                      className="block bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-purple-700/50 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-purple-600/10 rounded-lg group-hover:bg-purple-600/20 transition-colors">
                            <Icon className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold mb-1 group-hover:text-purple-400 transition-colors">
                              {position.title}
                            </h3>
                            <p className="text-gray-400 mb-3">{position.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className="flex items-center gap-1 text-gray-500">
                                <Briefcase className="w-4 h-4" />
                                {position.department}
                              </span>
                              <span className="flex items-center gap-1 text-gray-500">
                                <MapPin className="w-4 h-4" />
                                {position.location}
                              </span>
                              <span className="flex items-center gap-1 text-gray-500">
                                <Clock className="w-4 h-4" />
                                {position.type}
                              </span>
                              {position.salary && (
                                <span className="flex items-center gap-1 text-gray-500">
                                  <DollarSign className="w-4 h-4" />
                                  {position.salary}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors mt-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No open positions at the moment.</p>
                <p className="text-gray-400">
                  Join our talent network to be notified of future opportunities.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Benefits */}
        <div className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Benefits & Perks</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <Icon className="w-8 h-8 text-purple-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-gray-400">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Don't See Your Role?</h2>
            <p className="text-xl text-gray-300 mb-8">
              We're always looking for exceptional talent. Send us your resume and 
              tell us how you can contribute to our mission.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="mailto:careers@vibelux.ai"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
              >
                Send Your Resume
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
              >
                Learn About Us
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}