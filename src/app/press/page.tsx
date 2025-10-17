'use client';

import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { 
  Newspaper, Download, Mail, Award, Calendar,
  Globe, Users, TrendingUp, Leaf, ArrowRight
} from 'lucide-react';

const pressReleases = [
  {
    date: '2024-01-15',
    title: 'VibeLux Announces $5M Series A Funding',
    description: 'Funding will accelerate platform development and market expansion',
    link: '#'
  },
  {
    date: '2023-11-20',
    title: 'Blake Lange Named to Greenhouse Product News 40 Under 40',
    description: 'Recognition for innovation in controlled environment agriculture technology',
    link: '#'
  },
  {
    date: '2023-10-01',
    title: 'VibeLux Platform Helps Growers Save 30% on Energy Costs',
    description: 'New case study shows significant ROI for commercial greenhouses',
    link: '#'
  }
];

const mediaKit = {
  logos: [
    { name: 'VibeLux Logo - Light', format: 'PNG, SVG' },
    { name: 'VibeLux Logo - Dark', format: 'PNG, SVG' },
    { name: 'VibeLux Icon', format: 'PNG, SVG' }
  ],
  resources: [
    { name: 'Company Fact Sheet', format: 'PDF' },
    { name: 'Executive Bios', format: 'PDF' },
    { name: 'Product Screenshots', format: 'ZIP' }
  ]
};

const stats = [
  { label: 'Facilities Using VibeLux', value: '500+', icon: Globe },
  { label: 'Energy Savings', value: '20-40%', icon: TrendingUp },
  { label: 'Sq Ft Under Management', value: '10M+', icon: Leaf },
  { label: 'Team Members', value: '25+', icon: Users }
];

export default function PressPage() {
  return (
    <>
      <MarketingNavigation />
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-purple-900/20 to-gray-950 py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600/20 rounded-full mb-6">
              <Newspaper className="w-10 h-10 text-purple-400" />
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Press & Media
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The latest news, resources, and information about VibeLux and our mission 
              to transform controlled environment agriculture.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
                  <Icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                  <p className="text-gray-400">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Press */}
        <div className="bg-gray-900/50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-12">Recent Press Releases</h2>
            <div className="space-y-6">
              {pressReleases.map((release, index) => (
                <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {new Date(release.date).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{release.title}</h3>
                      <p className="text-gray-400">{release.description}</p>
                    </div>
                    <Link 
                      href={release.link}
                      className="ml-4 text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Awards & Recognition */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-12">Awards & Recognition</h2>
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-2xl p-8 border border-green-800/30">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-green-600/20 rounded-lg">
                <Award className="w-12 h-12 text-green-400" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">Greenhouse Product News 40 Under 40</h3>
                <p className="text-gray-400 mb-4">
                  Blake Lange, Co-founder and CEO, recognized for innovation in controlled environment 
                  agriculture technology and commitment to sustainable farming practices.
                </p>
                <Link 
                  href="#"
                  className="text-green-400 hover:text-green-300 transition-colors inline-flex items-center gap-2"
                >
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Media Kit */}
        <div className="bg-gray-900/50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-12">Media Kit</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-6 text-purple-400">Brand Assets</h3>
                <div className="space-y-4">
                  {mediaKit.logos.map((logo, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <span className="text-gray-300">{logo.name}</span>
                      <span className="text-sm text-gray-500">{logo.format}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-6 text-purple-400">Resources</h3>
                <div className="space-y-4">
                  {mediaKit.resources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <span className="text-gray-300">{resource.name}</span>
                      <span className="text-sm text-gray-500">{resource.format}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors">
                <Download className="w-5 h-5" />
                Download Full Media Kit
              </button>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Media Inquiries</h2>
          <p className="text-xl text-gray-300 mb-8">
            For press inquiries, interviews, or additional information, please contact our media team.
          </p>
          <div className="inline-flex items-center gap-3 text-lg">
            <Mail className="w-5 h-5 text-purple-400" />
            <a href="mailto:blake@vibelux.ai" className="text-purple-400 hover:text-purple-300 transition-colors">
              blake@vibelux.ai
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}