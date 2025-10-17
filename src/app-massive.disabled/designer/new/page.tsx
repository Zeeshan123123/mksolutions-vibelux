'use client';

import React, { useState } from 'react';
import { Plus, Import, Copy, BookOpen, ArrowRight, Layers, Grid, Camera } from 'lucide-react';

export default function NewDesignerPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const startOptions = [
    {
      id: 'blank',
      title: 'Blank Project',
      description: 'Start from scratch with a custom facility layout',
      icon: Plus,
      color: 'purple',
      action: 'Create New'
    },
    {
      id: 'import',
      title: 'Import CAD File',
      description: 'Upload DWG, DXF, or other CAD files',
      icon: Import,
      color: 'blue',
      action: 'Upload File'
    },
    {
      id: 'photo',
      title: 'Photo Capture',
      description: 'Start with facility photos for quick layout',
      icon: Camera,
      color: 'green',
      action: 'Take Photo'
    }
  ];

  const templates = [
    {
      id: 'cannabis-indoor',
      title: 'Cannabis Indoor Facility',
      description: '10,000 sq ft indoor cannabis cultivation',
      size: '10,000 sq ft',
      type: 'Cannabis',
      thumbnail: '/templates/cannabis-indoor.jpg'
    },
    {
      id: 'vertical-farm',
      title: 'Vertical Farm Tower',
      description: 'Multi-tier vertical farming setup',
      size: '5,000 sq ft',
      type: 'Vertical Farm',
      thumbnail: '/templates/vertical-farm.jpg'
    },
    {
      id: 'greenhouse',
      title: 'Greenhouse Supplemental',
      description: 'Greenhouse with supplemental LED lighting',
      size: '20,000 sq ft',
      type: 'Greenhouse',
      thumbnail: '/templates/greenhouse.jpg'
    },
    {
      id: 'research-lab',
      title: 'Research Laboratory',
      description: 'Multi-room research facility',
      size: '3,000 sq ft',
      type: 'Research',
      thumbnail: '/templates/research-lab.jpg'
    }
  ];

  const getIconColor = (color: string) => {
    switch (color) {
      case 'purple':
        return 'text-purple-400 bg-purple-400/10';
      case 'blue':
        return 'text-blue-400 bg-blue-400/10';
      case 'green':
        return 'text-green-400 bg-green-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-600/20 rounded-lg">
              <Layers className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">New Lighting Design</h1>
              <p className="text-gray-400">Create a new project or start from a template</p>
            </div>
          </div>
        </div>

        {/* Start Options */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6">How would you like to start?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {startOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all group text-left"
                >
                  <div className={`inline-flex p-3 rounded-lg mb-4 ${getIconColor(option.color)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-gray-400 mb-4">{option.description}</p>
                  <div className="flex items-center gap-2 text-purple-400 font-medium">
                    <span>{option.action}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Templates */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Start from Template</h2>
            <button className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Browse All Templates
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`bg-gray-900 rounded-xl border transition-all cursor-pointer ${
                  selectedTemplate === template.id
                    ? 'border-purple-500 ring-2 ring-purple-500/20'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                {/* Template Image Placeholder */}
                <div className="aspect-video bg-gray-800 rounded-t-xl flex items-center justify-center">
                  <Grid className="w-8 h-8 text-gray-600" />
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white">{template.title}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded">
                      {template.type}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{template.size}</span>
                    <button className="p-1 hover:bg-gray-800 rounded transition-colors">
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {selectedTemplate && (
          <div className="flex items-center gap-4 justify-center">
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Use This Template
            </button>
            <button
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              onClick={() => setSelectedTemplate(null)}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Development Notice */}
        <div className="mt-12 bg-yellow-900/20 rounded-xl border border-yellow-500/30 p-6">
          <div className="flex items-center gap-3">
            <Layers className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="font-semibold text-yellow-300 mb-2">Designer Tools Coming Soon</h3>
              <p className="text-sm text-gray-400">
                The full designer interface is in development. For now, you can use our existing{' '}
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