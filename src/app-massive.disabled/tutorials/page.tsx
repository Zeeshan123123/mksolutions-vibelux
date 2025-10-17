'use client';

import React from 'react';
import { BookOpen, Video, Download, Clock, Star, ChevronRight, Play } from 'lucide-react';

export default function TutorialsPage() {
  const tutorials = [
    {
      title: "Getting Started with VibeLux",
      description: "Learn the basics of setting up your first lighting design project",
      duration: "15 min",
      difficulty: "Beginner",
      type: "video",
      rating: 4.8,
      views: "2.1k"
    },
    {
      title: "Advanced Light Recipe Creation",
      description: "Master the art of creating custom light recipes for different crop phases",
      duration: "25 min",
      difficulty: "Advanced",
      type: "video",
      rating: 4.9,
      views: "1.5k"
    },
    {
      title: "Setting Up Environmental Controls",
      description: "Configure HVAC and environmental monitoring systems",
      duration: "20 min",
      difficulty: "Intermediate",
      type: "guide",
      rating: 4.7,
      views: "1.8k"
    },
    {
      title: "Arduino Sensor Integration",
      description: "Connect and configure Arduino-based sensors with VibeLux",
      duration: "30 min",
      difficulty: "Advanced",
      type: "guide",
      rating: 4.6,
      views: "956"
    },
    {
      title: "Data Analytics and Reporting",
      description: "Generate insights from your cultivation data",
      duration: "18 min",
      difficulty: "Intermediate",
      type: "video",
      rating: 4.8,
      views: "1.3k"
    },
    {
      title: "Mobile App Setup and Sync",
      description: "Connect your mobile devices for remote monitoring",
      duration: "12 min",
      difficulty: "Beginner",
      type: "video",
      rating: 4.7,
      views: "2.3k"
    }
  ];

  const categories = [
    { name: "Getting Started", count: 8 },
    { name: "Lighting Design", count: 12 },
    { name: "Environmental Control", count: 6 },
    { name: "Data Analytics", count: 9 },
    { name: "Hardware Setup", count: 5 },
    { name: "Mobile Integration", count: 4 }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'text-green-400 bg-green-400/10';
      case 'Intermediate':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'Advanced':
        return 'text-red-400 bg-red-400/10';
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
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">VibeLux Tutorials</h1>
              <p className="text-gray-400">Learn to master every aspect of your VibeLux system</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 sticky top-6">
              <h2 className="text-xl font-bold text-white mb-4">Categories</h2>
              <div className="space-y-2">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-800 transition-colors group"
                  >
                    <span className="text-gray-300 group-hover:text-white">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{category.count}</span>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800">
                <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download All PDFs
                </button>
              </div>
            </div>
          </div>

          {/* Tutorials Content */}
          <div className="lg:col-span-3">
            <div className="grid gap-6">
              {tutorials.map((tutorial, index) => (
                <div key={index} className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{tutorial.title}</h3>
                        <div className="flex items-center gap-1">
                          {tutorial.type === 'video' ? (
                            <Video className="w-4 h-4 text-blue-400" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-green-400" />
                          )}
                          <span className="text-xs text-gray-500 uppercase">
                            {tutorial.type}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-400 mb-3">{tutorial.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-400">{tutorial.duration}</span>
                        </div>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tutorial.difficulty)}`}>
                          {tutorial.difficulty}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-gray-400">{tutorial.rating}</span>
                        </div>
                        
                        <span className="text-gray-500">{tutorial.views} views</span>
                      </div>
                    </div>
                    
                    <button className="ml-4 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      <Play className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="mt-8 text-center">
              <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                Load More Tutorials
              </button>
            </div>
          </div>
        </div>

        {/* Development Notice */}
        <div className="mt-8 bg-yellow-900/20 rounded-xl border border-yellow-500/30 p-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="font-semibold text-yellow-300 mb-2">Tutorial Library Coming Soon</h3>
              <p className="text-sm text-gray-400">
                Our comprehensive tutorial library is in development. Check back soon for step-by-step guides and video tutorials.
                For immediate help, visit our{' '}
                <a href="/docs" className="text-yellow-400 hover:text-yellow-300">documentation</a>
                {' '}or{' '}
                <a href="/help" className="text-yellow-400 hover:text-yellow-300">support center</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}