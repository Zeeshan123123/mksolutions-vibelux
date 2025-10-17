'use client';

import React from 'react';
import { Star, Quote, Building, Users, TrendingUp, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  companySize: string;
  avatar: string;
  quote: string;
  results: {
    metric: string;
    value: string;
    description: string;
  }[];
  useCase: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 'sarah-cultivation',
    name: 'Sarah Martinez',
    role: 'Operations Manager',
    company: 'GreenTech Cultivation',
    companySize: '25-50 employees',
    avatar: 'SM',
    quote: "Before Vibelux document management, we had 15 different versions of our SOPs floating around. People didn't know which was current, and we had safety incidents because of outdated procedures. Now everyone works from the same playbook.",
    results: [
      { metric: '90%', value: 'reduction', description: 'in version confusion incidents' },
      { metric: '3 hours', value: 'saved', description: 'per week finding current docs' },
      { metric: '100%', value: 'compliance', description: 'audit readiness' }
    ],
    useCase: 'cultivation',
    rating: 5
  },
  {
    id: 'mike-compliance',
    name: 'Mike Chen',
    role: 'Quality Assurance Director',
    company: 'Precision Grow Systems',
    companySize: '100+ employees',
    avatar: 'MC',
    quote: "The audit trail feature saved us during our last compliance review. We could show exactly who changed what, when, and why. The inspector was actually impressed with our documentation process.",
    results: [
      { metric: '100%', value: 'pass rate', description: 'on compliance audits' },
      { metric: '5 days', value: 'reduced', description: 'audit preparation time' },
      { metric: '0', value: 'violations', description: 'since implementation' }
    ],
    useCase: 'compliance',
    rating: 5
  },
  {
    id: 'jessica-operations',
    name: 'Jessica Thompson',
    role: 'Head of Operations',
    company: 'Harvest Solutions',
    companySize: '10-25 employees',
    avatar: 'JT',
    quote: "We're growing fast and adding new locations. The document management keeps everyone on the same page across all sites. New employees can get up to speed quickly with our standardized procedures.",
    results: [
      { metric: '60%', value: 'faster', description: 'new employee onboarding' },
      { metric: '4 locations', value: 'synchronized', description: 'operating procedures' },
      { metric: '85%', value: 'improvement', description: 'in process consistency' }
    ],
    useCase: 'multi-location',
    rating: 5
  }
];

const companyLogos = [
  { name: 'GreenTech Cultivation', logo: 'GT' },
  { name: 'Precision Grow Systems', logo: 'PGS' },
  { name: 'Harvest Solutions', logo: 'HS' },
  { name: 'Urban Farms Co', logo: 'UF' },
  { name: 'Advanced Ag Tech', logo: 'AAT' },
  { name: 'Sustainable Growth', logo: 'SG' }
];

const stats = [
  { value: '500+', label: 'Growing Businesses', icon: <Building className="w-6 h-6" /> },
  { value: '10,000+', label: 'Documents Managed', icon: <Users className="w-6 h-6" /> },
  { value: '99.9%', label: 'Uptime Guarantee', icon: <TrendingUp className="w-6 h-6" /> },
  { value: '100%', label: 'Data Privacy', icon: <Shield className="w-6 h-6" /> }
];

export function CustomerTestimonials() {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by Growing Businesses
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how companies like yours are saving time, reducing errors, and 
            staying compliant with professional document management.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-3 text-purple-600">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Company Logos */}
        <div className="mb-16">
          <p className="text-center text-gray-500 mb-8">Trusted by companies of all sizes</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {companyLogos.map((company, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-600">{company.logo}</span>
                </div>
                <span className="text-sm text-gray-600 font-medium">{company.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="h-full">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-sm">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-xs text-gray-500">{testimonial.company}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {testimonial.companySize}
                  </Badge>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">{renderStars(testimonial.rating)}</div>
                  <span className="text-sm text-gray-600">
                    {testimonial.rating}.0 stars
                  </span>
                </div>

                {/* Quote */}
                <div className="relative mb-6">
                  <Quote className="w-6 h-6 text-purple-200 absolute -top-2 -left-1" />
                  <p className="text-gray-700 italic pl-6">"{testimonial.quote}"</p>
                </div>

                {/* Results */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-900 text-sm">Results:</h5>
                  {testimonial.results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {result.metric}
                        </div>
                        <div className="text-xs text-gray-600">{result.description}</div>
                      </div>
                      <div className="text-sm text-green-700 font-medium">
                        {result.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Use Case Badge */}
                <div className="mt-4 pt-4 border-t">
                  <Badge variant="secondary" className="text-xs">
                    {testimonial.useCase === 'cultivation' && '🌱 Cultivation'}
                    {testimonial.useCase === 'compliance' && '📋 Compliance'}
                    {testimonial.useCase === 'multi-location' && '🏢 Multi-Location'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Join Them?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Start your free trial today and see why growing businesses choose 
            Vibelux for professional document management.
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
              Start Free Trial
            </button>
            <button className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Schedule Demo
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            14-day free trial • Credit card required • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}