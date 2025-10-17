'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  GitBranch, 
  Users, 
  Lock, 
  Eye, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  FileText,
  Zap,
  Search,
  Download,
  History,
  Settings,
  ArrowRight,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomerTestimonials } from './CustomerTestimonials';
import { FeatureComparison } from './FeatureComparison';

interface FeatureDemo {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  visual: React.ReactNode;
  pricing: 'free' | 'starter' | 'professional' | 'enterprise';
}

const features: FeatureDemo[] = [
  {
    id: 'version-control',
    title: 'Smart Version Control',
    subtitle: 'Never lose track of document changes',
    description: 'Like GitHub for your SOPs - every change is tracked, versioned, and recoverable. See exactly who changed what, when, and why.',
    benefits: [
      'Automatic version numbering (v1.2.3)',
      'See exactly what changed between versions',
      'Restore any previous version instantly',
      'Track who made each change and why'
    ],
    visual: (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded border">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-blue-600" />
              <span className="font-medium">LED Growth Protocol v2.1.3</span>
              <Badge className="bg-green-100 text-green-800">Published</Badge>
            </div>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-100 rounded border">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">LED Growth Protocol v2.1.2</span>
              <Badge variant="outline">Previous</Badge>
            </div>
            <span className="text-sm text-gray-500">1 day ago</span>
          </div>
          <div className="text-center">
            <Button size="sm" variant="outline">
              <History className="w-4 h-4 mr-1" />
              View All Versions
            </Button>
          </div>
        </div>
      </div>
    ),
    pricing: 'starter'
  },
  {
    id: 'collaboration',
    title: 'Real-Time Collaboration',
    subtitle: 'Multiple people, zero conflicts',
    description: 'Check out documents like library books. Exclusive editing prevents conflicts, while shared review lets teams collaborate simultaneously.',
    benefits: [
      'Check out documents for exclusive editing',
      'Multiple reviewers can work simultaneously',
      'See who\'s working on what in real-time',
      'Automatic conflict prevention'
    ],
    visual: (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700">Currently Active:</div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span className="font-medium">You - Exclusive Edit</span>
            </div>
            <Badge className="bg-blue-100 text-blue-800">Expires in 1.5h</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              <span>Sarah M. - Shared Review</span>
            </div>
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          </div>
          <div className="text-center">
            <Button size="sm">
              <CheckCircle className="w-4 h-4 mr-1" />
              Check In Changes
            </Button>
          </div>
        </div>
      </div>
    ),
    pricing: 'professional'
  },
  {
    id: 'security',
    title: 'Enterprise Security',
    subtitle: 'Bank-level protection for your documents',
    description: 'Every document access is tracked, watermarked, and protected. Customer data is completely isolated - you only see your own activity.',
    benefits: [
      'Complete customer data isolation',
      'Every access tracked and logged',
      'Document watermarking for IP protection',
      'Role-based access control'
    ],
    visual: (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-2 rounded">
            <Shield className="w-4 h-4" />
            <span>All access logged and monitored</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Your IP: 192.168.1.100</span>
              <span>Viewed 2:34 PM</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Document: LED Growth Protocol</span>
              <span>Access Level: Premium</span>
            </div>
          </div>
          <div className="text-center pt-2 border-t">
            <div className="text-xs text-red-600 font-medium">
              🔒 CONFIDENTIAL - Unauthorized distribution prohibited
            </div>
          </div>
        </div>
      </div>
    ),
    pricing: 'enterprise'
  },
  {
    id: 'audit-trail',
    title: 'Complete Audit Trail',
    subtitle: 'Perfect for compliance and quality control',
    description: 'Every action is logged with timestamps, user details, and risk assessment. Export reports for audits and compliance.',
    benefits: [
      'Complete activity timeline',
      'Risk assessment for each action',
      'Export audit reports',
      'Compliance-ready documentation'
    ],
    visual: (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white rounded text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Version created by admin@vibelux.ai</span>
            </div>
            <Badge className="bg-green-100 text-green-800 text-xs">Low Risk</Badge>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Document checked out by user@company.com</span>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800 text-xs">Medium Risk</Badge>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Downloaded by contractor@external.com</span>
            </div>
            <Badge className="bg-red-100 text-red-800 text-xs">Critical Risk</Badge>
          </div>
          <div className="text-center pt-2">
            <Button size="sm" variant="outline">
              <Download className="w-4 h-4 mr-1" />
              Export Report
            </Button>
          </div>
        </div>
      </div>
    ),
    pricing: 'professional'
  }
];

const simplifiedBenefits = [
  {
    icon: <FileText className="w-8 h-8 text-blue-600" />,
    title: "Smart Document Control",
    description: "Version tracking, change history, and automatic backups - like having a time machine for your SOPs."
  },
  {
    icon: <Users className="w-8 h-8 text-green-600" />,
    title: "Team Collaboration",
    description: "Multiple people can work on documents simultaneously without conflicts or confusion."
  },
  {
    icon: <Shield className="w-8 h-8 text-purple-600" />,
    title: "Enterprise Security",
    description: "Bank-level security with complete privacy - your data stays yours, always."
  },
  {
    icon: <Clock className="w-8 h-8 text-orange-600" />,
    title: "Audit Ready",
    description: "Complete activity logs and compliance reports generated automatically."
  }
];

export function DocumentManagementFeatures() {
  const [selectedFeature, setSelectedFeature] = useState(features[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const getPricingColor = (pricing: string) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      starter: 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800'
    };
    return colors[pricing] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Document Management
          <span className="text-purple-600"> Made Simple</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Professional document version control and collaboration tools that actually work. 
          Think GitHub meets Google Docs, built specifically for growing businesses.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
            <Play className="w-5 h-5 mr-2" />
            Watch 2-Minute Demo
          </Button>
          <Button size="lg" variant="outline">
            Try Free for 14 Days
          </Button>
        </div>
      </div>

      {/* Simple Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {simplifiedBenefits.map((benefit, index) => (
          <Card key={index} className="text-center p-6">
            <div className="flex justify-center mb-4">
              {benefit.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
            <p className="text-gray-600 text-sm">{benefit.description}</p>
          </Card>
        ))}
      </div>

      {/* Interactive Feature Demo */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">See It In Action</h2>
          <p className="text-gray-600">Click on any feature below to see how it works</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feature Selection */}
          <div className="lg:col-span-1">
            <div className="space-y-3">
              {features.map((feature) => (
                <Card 
                  key={feature.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedFeature.id === feature.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                  }`}
                  onClick={() => setSelectedFeature(feature)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                      <Badge className={getPricingColor(feature.pricing)}>
                        {feature.pricing}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{feature.subtitle}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Feature Demo */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedFeature.title}</CardTitle>
                    <p className="text-gray-600 mt-1">{selectedFeature.description}</p>
                  </div>
                  <Badge className={getPricingColor(selectedFeature.pricing)}>
                    {selectedFeature.pricing}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Visual Demo */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Live Preview:</h4>
                    {selectedFeature.visual}
                  </div>

                  {/* Benefits */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">What You Get:</h4>
                    <ul className="space-y-2">
                      {selectedFeature.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Perfect For</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-6">
            <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Growing Cultivation Operations</h3>
            <p className="text-gray-600 text-sm">
              Standard Operating Procedures, safety protocols, and cultivation guides that need version control and team collaboration.
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <Settings className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibnel mb-2">Quality & Compliance Teams</h3>
            <p className="text-gray-600 text-sm">
              Audit trails, change approvals, and compliance documentation with automatic reporting and risk assessment.
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Multi-Location Businesses</h3>
            <p className="text-gray-600 text-sm">
              Ensure all locations follow the same procedures with centralized document management and real-time updates.
            </p>
          </Card>
        </div>
      </div>

      {/* Simple Pricing Preview */}
      <div className="bg-gray-50 rounded-2xl p-8 mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Simple, Transparent Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { plan: 'Free', price: '$0', features: ['Basic document storage', 'Simple version history', '5 documents max'] },
            { plan: 'Starter', price: '$29', features: ['Version control', 'Team collaboration', 'Unlimited documents'] },
            { plan: 'Professional', price: '$99', features: ['Advanced security', 'Audit trails', 'Compliance reports'] },
            { plan: 'Enterprise', price: 'Custom', features: ['White-label', 'Advanced integrations', 'Dedicated support'] }
          ].map((tier, index) => (
            <Card key={index} className={index === 1 ? 'ring-2 ring-purple-500' : ''}>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-lg mb-2">{tier.plan}</h3>
                <div className="text-3xl font-bold text-purple-600 mb-4">
                  {tier.price}
                  {tier.price !== 'Custom' && <span className="text-sm text-gray-600">/month</span>}
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-4" variant={index === 1 ? 'default' : 'outline'}>
                  {tier.plan === 'Free' ? 'Get Started' : 'Start Trial'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Customer Testimonials */}
      <CustomerTestimonials />

      {/* Feature Comparison */}
      <FeatureComparison />

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Join hundreds of growing businesses who trust us with their most important documents. 
          Start free, upgrade when you're ready.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button size="lg" variant="outline">
            Schedule Demo
          </Button>
        </div>
      </div>
    </div>
  );
}