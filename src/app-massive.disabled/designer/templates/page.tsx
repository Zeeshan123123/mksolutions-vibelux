'use client';

import React, { useState } from 'react';
import { 
  Layout, 
  Search, 
  Filter, 
  Star, 
  Download, 
  Eye, 
  Copy, 
  Grid, 
  Building2,
  Leaf,
  Layers,
  FlaskConical,
  ArrowRight,
  Users,
  Calendar,
  MapPin
} from 'lucide-react';

export default function DesignerTemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All Templates', icon: Grid, count: 24 },
    { id: 'cannabis', name: 'Cannabis', icon: Leaf, count: 8 },
    { id: 'vertical-farm', name: 'Vertical Farming', icon: Layers, count: 6 },
    { id: 'greenhouse', name: 'Greenhouse', icon: Building2, count: 7 },
    { id: 'research', name: 'Research', icon: FlaskConical, count: 3 }
  ];

  const templates = [
    {
      id: 'cannabis-indoor-10k',
      name: 'Cannabis Indoor 10K',
      description: 'Standard indoor cannabis facility with flower and veg rooms',
      category: 'cannabis',
      size: '10,000 sq ft',
      rooms: 6,
      fixtures: 240,
      estimatedCost: '$285,000',
      popularity: 95,
      rating: 4.8,
      downloads: 1200,
      author: 'VibeLux Team',
      lastUpdated: '2 weeks ago',
      tags: ['Indoor', 'Commercial', 'Multi-Room'],
      thumbnail: '/templates/cannabis-10k.jpg',
      featured: true
    },
    {
      id: 'vertical-tower-5k',
      name: 'Vertical Farm Tower',
      description: '5-tier vertical farming setup for leafy greens',
      category: 'vertical-farm',
      size: '5,000 sq ft',
      rooms: 1,
      fixtures: 180,
      estimatedCost: '$320,000',
      popularity: 88,
      rating: 4.7,
      downloads: 856,
      author: 'VibeLux Team',
      lastUpdated: '1 week ago',
      tags: ['Vertical', 'Leafy Greens', 'High Density'],
      thumbnail: '/templates/vertical-tower.jpg',
      featured: true
    },
    {
      id: 'greenhouse-supplement',
      name: 'Greenhouse Supplemental',
      description: 'LED supplemental lighting for existing greenhouse',
      category: 'greenhouse',
      size: '25,000 sq ft',
      rooms: 4,
      fixtures: 320,
      estimatedCost: '$450,000',
      popularity: 82,
      rating: 4.6,
      downloads: 720,
      author: 'VibeLux Team',
      lastUpdated: '3 weeks ago',
      tags: ['Supplemental', 'Large Scale', 'Tomatoes'],
      thumbnail: '/templates/greenhouse-supp.jpg',
      featured: false
    },
    {
      id: 'research-lab-multi',
      name: 'Research Laboratory',
      description: 'Multi-room research facility for controlled studies',
      category: 'research',
      size: '3,500 sq ft',
      rooms: 8,
      fixtures: 120,
      estimatedCost: '$180,000',
      popularity: 76,
      rating: 4.9,
      downloads: 445,
      author: 'VibeLux Team',
      lastUpdated: '1 month ago',
      tags: ['Research', 'Controlled', 'Precision'],
      thumbnail: '/templates/research-lab.jpg',
      featured: false
    },
    {
      id: 'cannabis-micro',
      name: 'Micro Cannabis Facility',
      description: 'Small-scale cannabis cultivation for boutique operations',
      category: 'cannabis',
      size: '2,500 sq ft',
      rooms: 3,
      fixtures: 80,
      estimatedCost: '$95,000',
      popularity: 71,
      rating: 4.5,
      downloads: 620,
      author: 'Community',
      lastUpdated: '2 months ago',
      tags: ['Micro', 'Boutique', 'Craft'],
      thumbnail: '/templates/cannabis-micro.jpg',
      featured: false
    },
    {
      id: 'vertical-herbs',
      name: 'Vertical Herb Garden',
      description: 'Compact vertical setup for culinary herbs',
      category: 'vertical-farm',
      size: '1,200 sq ft',
      rooms: 1,
      fixtures: 45,
      estimatedCost: '$65,000',
      popularity: 68,
      rating: 4.4,
      downloads: 380,
      author: 'Community',
      lastUpdated: '3 months ago',
      tags: ['Herbs', 'Compact', 'Urban'],
      thumbnail: '/templates/vertical-herbs.jpg',
      featured: false
    }
  ];

  const filteredTemplates = templates.filter(template => {
    if (selectedCategory === 'all') return true;
    return template.category === selectedCategory;
  });

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      const Icon = category.icon;
      return <Icon className="w-4 h-4" />;
    }
    return <Grid className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-600/20 rounded-lg">
              <Layout className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Design Templates</h1>
              <p className="text-gray-400">Start your project with proven lighting designs</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 sticky top-6">
              <h2 className="text-lg font-bold text-white mb-4">Categories</h2>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 text-left rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-purple-600 text-white'
                          : 'hover:bg-gray-800 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{category.name}</span>
                      </div>
                      <span className="text-xs opacity-75">{category.count}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {['Indoor', 'Commercial', 'Research', 'Vertical', 'Supplemental'].map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-gray-800 text-gray-400 rounded hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="lg:col-span-3">
            {/* Featured Templates */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Featured Templates
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {filteredTemplates.filter(t => t.featured).map((template) => (
                  <div
                    key={template.id}
                    className="bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-all overflow-hidden group"
                  >
                    {/* Template Image */}
                    <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
                      <Grid className="w-12 h-12 text-gray-600" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 text-xs bg-yellow-500 text-black rounded font-medium">
                          FEATURED
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors">
                          <Eye className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">
                          {template.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-400">{template.rating}</span>
                        </div>
                      </div>

                      <p className="text-gray-400 text-sm mb-3">{template.description}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {template.size}
                        </div>
                        <div className="flex items-center gap-1">
                          <Grid className="w-3 h-3" />
                          {template.fixtures} fixtures
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {template.downloads}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-400">{template.estimatedCost}</span>
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-800 rounded transition-colors">
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
                            <Copy className="w-4 h-4" />
                            Use Template
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Templates */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">
                All Templates ({filteredTemplates.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-all overflow-hidden group"
                  >
                    {/* Template Image */}
                    <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
                      <Grid className="w-8 h-8 text-gray-600" />
                      {template.featured && (
                        <div className="absolute top-2 left-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        {getCategoryIcon(template.category)}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3">{template.description}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                        <div>{template.size}</div>
                        <div>{template.fixtures} fixtures</div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          {template.rating}
                        </div>
                        <div>{template.downloads} downloads</div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-green-400">{template.estimatedCost}</span>
                        <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors">
                          Use
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Development Notice */}
        <div className="mt-12 bg-yellow-900/20 rounded-xl border border-yellow-500/30 p-6">
          <div className="flex items-center gap-3">
            <Layout className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="font-semibold text-yellow-300 mb-2">Template Library Expanding</h3>
              <p className="text-sm text-gray-400">
                Our template library is growing weekly. For immediate design needs, use our{' '}
                <a href="/design/advanced" className="text-yellow-400 hover:text-yellow-300">advanced designer</a>
                {' '}or{' '}
                <a href="/calculators" className="text-yellow-400 hover:text-yellow-300">lighting calculators</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}