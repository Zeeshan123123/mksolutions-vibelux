'use client';

import React, { useState } from 'react';
import { logger } from '@/lib/client-logger';
import { 
  Lightbulb, Send, CheckCircle, Star, TrendingUp, 
  Users, Vote, MessageCircle, ArrowRight, Plus,
  Zap, BarChart3, Settings, Smartphone, Brain
} from 'lucide-react';
import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';

interface FeatureRequest {
  title: string;
  description: string;
  category: string;
  priority: string;
  useCase: string;
  userType: string;
  expectedBenefit: string;
  currentWorkaround: string;
  email: string;
  name: string;
  company: string;
}

export default function FeatureRequestPage() {
  const [formData, setFormData] = useState<FeatureRequest>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    useCase: '',
    userType: '',
    expectedBenefit: '',
    currentWorkaround: '',
    email: '',
    name: '',
    company: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/feature-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        logger.error('system', 'Failed to submit feature request');
      }
    } catch (error) {
      logger.error('system', 'Error submitting feature request:', error );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (submitted) {
    return (
      <>
        <MarketingNavigation />
        <div className="min-h-screen bg-gray-950 text-white pt-20">
          <div className="max-w-4xl mx-auto px-6 py-20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600/20 rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Feature Request Submitted!</h1>
              <p className="text-xl text-gray-300 mb-8">
                Thank you for helping us improve VibeLux. We'll review your suggestion and keep you updated on its progress.
              </p>
              <div className="bg-gray-900 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
                <h3 className="font-semibold text-white mb-4">What happens next?</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-300">Our product team will review your request within 5 business days</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-300">We'll evaluate feasibility and user impact</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-300">You'll receive updates if your feature is planned for development</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Submit Another Request
                </button>
                <a 
                  href="/roadmap"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-lg transition-all duration-300"
                >
                  View Product Roadmap
                </a>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <MarketingNavigation />
      <div className="min-h-screen bg-gray-950 text-white pt-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-purple-900/20 to-gray-950 py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600/20 rounded-full mb-6">
              <Lightbulb className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Request a Feature
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Have an idea that could improve VibeLux? Share your feature requests and help shape the future of agricultural technology.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Feature Request Benefits */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold mb-6">Why Request Features?</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Community-Driven</h3>
                    <p className="text-gray-400">
                      Your input directly influences our development priorities and product roadmap.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Real Impact</h3>
                    <p className="text-gray-400">
                      Features born from user requests often become the most valuable parts of our platform.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Stay Informed</h3>
                    <p className="text-gray-400">
                      Get updates on your request's progress and be first to know when it's released.
                    </p>
                  </div>
                </div>
              </div>

              {/* Popular Categories */}
              <div className="mt-12 p-6 bg-gray-900 rounded-xl border border-gray-800">
                <h3 className="font-semibold mb-4">Popular Categories</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-300">Analytics & Reporting</span>
                    </div>
                    <span className="text-xs text-gray-500">42%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-300">AI & Automation</span>
                    </div>
                    <span className="text-xs text-gray-500">28%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-300">Mobile Features</span>
                    </div>
                    <span className="text-xs text-gray-500">18%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-gray-300">Integrations</span>
                    </div>
                    <span className="text-xs text-gray-500">12%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Request Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <h3 className="font-semibold mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Company</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                        placeholder="Your company name"
                      />
                    </div>
                  </div>
                </div>

                {/* Feature Details */}
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <h3 className="font-semibold mb-4">Feature Request Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Feature Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                        placeholder="Brief, descriptive title for your feature request"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Category *</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                        >
                          <option value="">Select category</option>
                          <option value="analytics">Analytics & Reporting</option>
                          <option value="ai-automation">AI & Automation</option>
                          <option value="mobile">Mobile Features</option>
                          <option value="integrations">Integrations</option>
                          <option value="design-tools">Design Tools</option>
                          <option value="calculations">Calculators & Tools</option>
                          <option value="data-export">Data & Export</option>
                          <option value="user-interface">User Interface</option>
                          <option value="sensors">Sensors & IoT</option>
                          <option value="energy">Energy Management</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Priority</label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                        >
                          <option value="low">Nice to Have</option>
                          <option value="medium">Important</option>
                          <option value="high">Critical</option>
                          <option value="urgent">Urgent/Blocking</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">User Type</label>
                      <select
                        name="userType"
                        value={formData.userType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                      >
                        <option value="">Select your role</option>
                        <option value="grower">Grower/Cultivator</option>
                        <option value="consultant">Consultant</option>
                        <option value="researcher">Researcher</option>
                        <option value="engineer">Engineer</option>
                        <option value="manager">Operations Manager</option>
                        <option value="investor">Investor</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Feature Description *</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-y"
                        placeholder="Describe the feature you'd like to see. Be as specific as possible about what it should do."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Use Case & Problem *</label>
                      <textarea
                        name="useCase"
                        value={formData.useCase}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-y"
                        placeholder="What problem does this solve? How would you use this feature in your daily workflow?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Expected Benefit</label>
                      <textarea
                        name="expectedBenefit"
                        value={formData.expectedBenefit}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-y"
                        placeholder="How would this feature improve your operations? What value would it provide?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Current Workaround</label>
                      <textarea
                        name="currentWorkaround"
                        value={formData.currentWorkaround}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-y"
                        placeholder="How do you currently handle this task? What tools or methods do you use as alternatives?"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Feature Request
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-y border-purple-800/30 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Explore More Ways to Get Involved</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-3">Product Roadmap</h3>
                <p className="text-gray-400 mb-4">
                  See what features are planned, in development, and recently released.
                </p>
                <a href="/roadmap" className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                  View Roadmap <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-semibold mb-3">Community Forum</h3>
                <p className="text-gray-400 mb-4">
                  Discuss ideas with other users and vote on popular feature requests.
                </p>
                <a href="/community" className="text-green-400 hover:text-green-300 font-medium flex items-center gap-1">
                  Join Discussion <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold mb-3">Beta Testing</h3>
                <p className="text-gray-400 mb-4">
                  Get early access to new features and help shape their development.
                </p>
                <a href="/beta" className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1">
                  Join Beta <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}