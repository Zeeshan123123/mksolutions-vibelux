'use client';

import React, { useState } from 'react';
import { Check, X, Star, AlertTriangle, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ComparisonItem {
  feature: string;
  description: string;
  basicSolution: boolean | string;
  vibelux: boolean | string;
  importance: 'critical' | 'important' | 'nice-to-have';
  category: string;
}

const comparisonData: ComparisonItem[] = [
  // Version Control
  {
    feature: 'Document Version History',
    description: 'Track changes and revert to previous versions',
    basicSolution: 'Manual naming (v1, v2, etc.)',
    vibelux: 'Automatic semantic versioning',
    importance: 'critical',
    category: 'Version Control'
  },
  {
    feature: 'Change Tracking',
    description: 'See exactly what changed between versions',
    basicSolution: false,
    vibelux: 'Line-by-line diff with user attribution',
    importance: 'critical',
    category: 'Version Control'
  },
  {
    feature: 'Automatic Backups',
    description: 'Never lose your work',
    basicSolution: 'Manual file copying',
    vibelux: 'Automatic with every save',
    importance: 'important',
    category: 'Version Control'
  },

  // Collaboration
  {
    feature: 'Multi-User Editing',
    description: 'Multiple people working on documents',
    basicSolution: 'Email attachments back and forth',
    vibelux: 'Real-time with conflict prevention',
    importance: 'critical',
    category: 'Collaboration'
  },
  {
    feature: 'Check-in/Check-out System',
    description: 'Prevent editing conflicts',
    basicSolution: false,
    vibelux: 'Exclusive and shared locks',
    importance: 'critical',
    category: 'Collaboration'
  },
  {
    feature: 'Review & Approval Workflow',
    description: 'Formal approval process for changes',
    basicSolution: 'Email chains',
    vibelux: 'Built-in approval workflow',
    importance: 'important',
    category: 'Collaboration'
  },

  // Security & Compliance
  {
    feature: 'Access Control',
    description: 'Control who can see and edit documents',
    basicSolution: 'Folder permissions',
    vibelux: 'Role-based with subscription tiers',
    importance: 'critical',
    category: 'Security'
  },
  {
    feature: 'Audit Trail',
    description: 'Complete log of all document activities',
    basicSolution: false,
    vibelux: 'Every action logged with timestamps',
    importance: 'critical',
    category: 'Security'
  },
  {
    feature: 'Document Watermarking',
    description: 'IP protection and access tracking',
    basicSolution: false,
    vibelux: 'Dynamic watermarks with user info',
    importance: 'important',
    category: 'Security'
  },
  {
    feature: 'Customer Data Isolation',
    description: 'Complete privacy between customers',
    basicSolution: 'Shared systems',
    vibelux: 'Complete isolation by design',
    importance: 'critical',
    category: 'Security'
  },

  // Ease of Use
  {
    feature: 'Search & Discovery',
    description: 'Find documents quickly',
    basicSolution: 'Manual file browsing',
    vibelux: 'Full-text search with filters',
    importance: 'important',
    category: 'Usability'
  },
  {
    feature: 'Templates & Categories',
    description: 'Organized document structure',
    basicSolution: 'Manual organization',
    vibelux: 'Pre-built templates by industry',
    importance: 'nice-to-have',
    category: 'Usability'
  },
  {
    feature: 'Mobile Access',
    description: 'Access documents anywhere',
    basicSolution: 'Email on phone',
    vibelux: 'Full mobile interface',
    importance: 'important',
    category: 'Usability'
  }
];

const categories = [...new Set(comparisonData.map(item => item.category))];

export function FeatureComparison() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredData = selectedCategory === 'all' 
    ? comparisonData 
    : comparisonData.filter(item => item.category === selectedCategory);

  const renderValue = (value: boolean | string, isVibelux: boolean = false) => {
    if (typeof value === 'boolean') {
      return value ? (
        <div className="flex items-center gap-2">
          <Check className={`w-5 h-5 ${isVibelux ? 'text-green-600' : 'text-gray-400'}`} />
          <span className={isVibelux ? 'text-green-600 font-medium' : 'text-gray-600'}>
            {isVibelux ? 'Included' : 'Basic'}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <X className="w-5 h-5 text-red-400" />
          <span className="text-red-600">Not available</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        {isVibelux ? (
          <>
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-600 font-medium">{value}</span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span className="text-gray-600">{value}</span>
          </>
        )}
      </div>
    );
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'important': return 'bg-yellow-100 text-yellow-800';
      case 'nice-to-have': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'important': return <Star className="w-4 h-4" />;
      case 'nice-to-have': return <Zap className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Professional Document Management?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how Vibelux compares to basic file sharing and email-based document workflows.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Features
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Comparison Table */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-50">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-5">
                <CardTitle className="text-lg">Feature</CardTitle>
              </div>
              <div className="col-span-3 text-center">
                <CardTitle className="text-lg text-gray-600">
                  Basic Solution
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Email + File Sharing
                </p>
              </div>
              <div className="col-span-3 text-center">
                <CardTitle className="text-lg text-purple-600">
                  Vibelux
                </CardTitle>
                <p className="text-sm text-purple-500 mt-1">
                  Professional Platform
                </p>
              </div>
              <div className="col-span-1 text-center">
                <CardTitle className="text-sm text-gray-600">
                  Priority
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredData.map((item, index) => (
              <div 
                key={index}
                className={`grid grid-cols-12 gap-4 items-center p-4 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } ${index !== filteredData.length - 1 ? 'border-b border-gray-200' : ''}`}
              >
                <div className="col-span-5">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {item.feature}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {item.description}
                  </p>
                </div>
                <div className="col-span-3 text-center">
                  {renderValue(item.basicSolution, false)}
                </div>
                <div className="col-span-3 text-center">
                  {renderValue(item.vibelux, true)}
                </div>
                <div className="col-span-1 text-center">
                  <Badge 
                    className={`${getImportanceColor(item.importance)} text-xs`}
                  >
                    <div className="flex items-center gap-1">
                      {getImportanceIcon(item.importance)}
                      <span className="capitalize">{item.importance.replace('-', ' ')}</span>
                    </div>
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Basic Solutions
            </h3>
            <p className="text-gray-600 text-sm">
              Email attachments and file sharing create version confusion, 
              security risks, and compliance headaches.
            </p>
          </Card>

          <Card className="text-center p-6 ring-2 ring-purple-500">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Vibelux Platform
            </h3>
            <p className="text-gray-600 text-sm">
              Professional document management with version control, 
              collaboration tools, and enterprise security.
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              The Result
            </h3>
            <p className="text-gray-600 text-sm">
              90% reduction in version confusion, 100% audit compliance, 
              and teams that actually collaborate effectively.
            </p>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center mt-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Upgrade Your Document Workflow?
          </h3>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Join hundreds of growing businesses who've eliminated version confusion 
            and compliance headaches with professional document management.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
              See All Features
            </Button>
          </div>
          <p className="text-sm text-purple-200 mt-4">
            14-day free trial • Credit card required • Core features included
          </p>
        </div>
      </div>
    </div>
  );
}