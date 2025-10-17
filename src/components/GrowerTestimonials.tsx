'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Star, TrendingUp, Clock, Zap, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  growerName: string;
  farmName: string;
  location: string;
  cropType: string;
  imageUrl?: string;
  quote: string;
  metrics: {
    yieldImprovement?: string;
    energySavings?: string;
    timeSaved?: string;
    roiPeriod?: string;
  };
  rating: number;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    growerName: 'Beta Program',
    farmName: 'Early Access',
    location: 'Join Waitlist',
    cropType: 'All Crops',
    quote: "We're currently working with select beta partners to refine our platform. Our invitation-only beta program is helping us build the most advanced controlled environment agriculture platform. Real testimonials will be available after our public launch.",
    metrics: {
      yieldImprovement: 'Beta Testing',
      energySavings: 'In Development',
      timeSaved: 'Testing Phase',
      roiPeriod: 'Launch Q2 2025'
    },
    rating: 5,
    date: '2024-12-01'
  }
];

export default function GrowerTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const MetricCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Building with Beta Partners
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're working closely with experienced growers to build the future of controlled environment agriculture. Real customer stories coming soon.
          </p>
        </div>

        {/* Single Beta Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 shadow-xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Join Our Beta Program
              </h3>
              <p className="text-gray-600">
                Limited early access • Invitation only • Launch Q2 2025
              </p>
            </div>

            <div className="relative mb-6">
              <Quote className="absolute -top-2 -left-2 w-8 h-8 text-gray-200" />
              <p className="text-gray-700 italic pl-6 text-lg text-center">
                "{testimonials[0].quote}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <MetricCard
                icon={TrendingUp}
                label="Platform Status"
                value="Beta Testing"
                color="bg-blue-500"
              />
              <MetricCard
                icon={Zap}
                label="Launch Target"
                value="Q2 2025"
                color="bg-green-500"
              />
              <MetricCard
                icon={Clock}
                label="Beta Partners"
                value="8+ Facilities"
                color="bg-purple-500"
              />
              <MetricCard
                icon={Star}
                label="Access"
                value="Invitation Only"
                color="bg-orange-500"
              />
            </div>

            <div className="text-center">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Request Beta Access
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Limited spots available for qualified facilities
              </p>
            </div>
          </Card>
        </div>

        {/* Stats Bar */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white rounded-lg shadow-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">8+</div>
            <div className="text-gray-600">Beta Facilities</div>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">Q2 2025</div>
            <div className="text-gray-600">Public Launch</div>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">Invite Only</div>
            <div className="text-gray-600">Current Access</div>
          </div>
        </div>
      </div>
    </section>
  );
}