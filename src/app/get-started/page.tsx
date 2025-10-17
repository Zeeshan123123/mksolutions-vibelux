'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logger } from '@/lib/client-logger';
import { 
  Sparkles, Building, Leaf, Package, TrendingUp, 
  ArrowRight, CheckCircle, Zap, Users, BarChart3,
  Shield, Clock, DollarSign, ChevronRight, Loader2,
  Thermometer, Droplets, Sun, Wind
} from 'lucide-react';

interface OnboardingData {
  facilityType: string;
  facilitySize: string;
  crops: string[];
  goals: string[];
  equipment: string[];
  experience: string;
  budget: string;
  timeline: string;
}

export default function GetStartedPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    facilityType: '',
    facilitySize: '',
    crops: [],
    goals: [],
    equipment: [],
    experience: '',
    budget: '',
    timeline: ''
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Save onboarding data
      await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      logger.error('system', 'Onboarding error:', error );
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-teal-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/3 w-40 h-40 bg-green-400/10 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative max-w-4xl mx-auto px-6 py-12">
        {/* Welcome Hero Section */}
        {step === 1 && (
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-400/20 rounded-full mb-8">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 font-medium">Welcome to VibeLux</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Let's grow something
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"> amazing </span>
              together
            </h1>
            <p className="text-xl text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
              We're excited to help you optimize your growing operation. This quick setup takes just 2 minutes 
              and helps us personalize VibeLux for your specific needs.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">VibeLux</span>
          </Link>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-emerald-200/60 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
          >
            I'll do this later
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-emerald-200">Step {step} of {totalSteps}</span>
              <span className="text-xs text-emerald-300/60 bg-emerald-500/10 px-2 py-1 rounded-full">
                ~{Math.ceil((5 - step) * 0.5)} min remaining
              </span>
            </div>
            <span className="text-sm text-emerald-200/80">{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="h-3 bg-emerald-900/30 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500 ease-out rounded-full shadow-lg"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-emerald-900/20 backdrop-blur-xl rounded-2xl border border-emerald-400/20 p-8 shadow-2xl">
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-400/10 rounded-full mb-4">
                  <Building className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-300 font-medium">Your Growing Space</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Tell us about your facility</h2>
                <p className="text-emerald-100/70">This helps us customize VibeLux to perfectly match your growing operation</p>
              </div>

              <div>
                <label className="block text-lg font-medium text-emerald-100 mb-6">
                  What type of facility do you operate?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { value: 'greenhouse', label: 'Greenhouse', icon: Building },
                    { value: 'vertical-farm', label: 'Vertical Farm', icon: Building },
                    { value: 'indoor-grow', label: 'Indoor Grow', icon: Building },
                    { value: 'container-farm', label: 'Container Farm', icon: Package }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setData({ ...data, facilityType: option.value })}
                      className={`relative flex items-center gap-4 p-5 rounded-xl border transition-all group hover:scale-105 ${
                        data.facilityType === option.value
                          ? 'bg-emerald-500/15 border-emerald-400 shadow-lg shadow-emerald-400/20'
                          : 'bg-emerald-900/20 border-emerald-400/30 hover:border-emerald-400/50 hover:bg-emerald-500/10'
                      }`}
                    >
                      <option.icon className={`w-6 h-6 transition-colors ${
                        data.facilityType === option.value ? 'text-emerald-400' : 'text-emerald-300'
                      }`} />
                      <span className="font-medium text-white group-hover:text-emerald-100">{option.label}</span>
                      {data.facilityType === option.value && (
                        <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium text-emerald-100 mb-6">
                  What's your facility size?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'small', label: 'Small', description: '< 10,000 sq ft' },
                    { value: 'medium', label: 'Medium', description: '10,000 - 50,000 sq ft' },
                    { value: 'large', label: 'Large', description: '> 50,000 sq ft' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setData({ ...data, facilitySize: option.value })}
                      className={`relative p-5 rounded-xl border transition-all group hover:scale-105 ${
                        data.facilitySize === option.value
                          ? 'bg-emerald-500/15 border-emerald-400 shadow-lg shadow-emerald-400/20'
                          : 'bg-emerald-900/20 border-emerald-400/30 hover:border-emerald-400/50 hover:bg-emerald-500/10'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-medium text-white mb-1 group-hover:text-emerald-100">{option.label}</div>
                        <div className="text-sm text-emerald-200/60">{option.description}</div>
                      </div>
                      {data.facilitySize === option.value && (
                        <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-400/10 rounded-full mb-4">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-300 font-medium">Your Crops</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">What do you grow?</h2>
                <p className="text-emerald-100/70">Tell us about your crops so we can optimize everything perfectly</p>
              </div>

              <div>
                <label className="block text-lg font-medium text-emerald-100 mb-6">
                  Primary crops (select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: 'leafy-greens', label: 'Leafy Greens', icon: Leaf },
                    { value: 'herbs', label: 'Herbs', icon: Leaf },
                    { value: 'tomatoes', label: 'Tomatoes', icon: Leaf },
                    { value: 'berries', label: 'Berries', icon: Leaf },
                    { value: 'cannabis', label: 'Cannabis', icon: Leaf },
                    { value: 'flowers', label: 'Flowers', icon: Leaf },
                    { value: 'microgreens', label: 'Microgreens', icon: Leaf },
                    { value: 'mushrooms', label: 'Mushrooms', icon: Leaf },
                    { value: 'other', label: 'Other', icon: Leaf }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setData({ 
                        ...data, 
                        crops: toggleArrayItem(data.crops, option.value)
                      })}
                      className={`relative flex items-center gap-3 p-4 rounded-xl border transition-all group hover:scale-105 ${
                        data.crops.includes(option.value)
                          ? 'bg-emerald-500/15 border-emerald-400 shadow-lg shadow-emerald-400/20'
                          : 'bg-emerald-900/20 border-emerald-400/30 hover:border-emerald-400/50 hover:bg-emerald-500/10'
                      }`}
                    >
                      <option.icon className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium text-white group-hover:text-emerald-100">{option.label}</span>
                      {data.crops.includes(option.value) && (
                        <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium text-emerald-100 mb-6">
                  How experienced are you with controlled environment agriculture?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'beginner', label: 'Just Starting', description: 'New to controlled environment agriculture', emoji: '🌱' },
                    { value: 'intermediate', label: 'Growing My Skills', description: '1-3 years of experience', emoji: '🌿' },
                    { value: 'expert', label: 'Seasoned Grower', description: '3+ years of experience', emoji: '🌳' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setData({ ...data, experience: option.value })}
                      className={`relative p-5 rounded-xl border transition-all group hover:scale-105 ${
                        data.experience === option.value
                          ? 'bg-emerald-500/15 border-emerald-400 shadow-lg shadow-emerald-400/20'
                          : 'bg-emerald-900/20 border-emerald-400/30 hover:border-emerald-400/50 hover:bg-emerald-500/10'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{option.emoji}</div>
                        <div className="font-medium text-white mb-1 group-hover:text-emerald-100">{option.label}</div>
                        <div className="text-xs text-emerald-200/60">{option.description}</div>
                      </div>
                      {data.experience === option.value && (
                        <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-400/10 rounded-full mb-4">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-300 font-medium">Your Goals</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">What success looks like for you</h2>
                <p className="text-emerald-100/70">Help us understand your priorities so we can customize your experience</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { value: 'increase-yield', label: 'Boost My Harvest', description: 'Maximize production output', icon: TrendingUp },
                  { value: 'reduce-costs', label: 'Save Money', description: 'Lower operational expenses', icon: DollarSign },
                  { value: 'improve-quality', label: 'Premium Quality', description: 'Enhance crop quality', icon: Shield },
                  { value: 'save-energy', label: 'Go Green', description: 'Reduce energy consumption', icon: Zap },
                  { value: 'automate', label: 'Work Smarter', description: 'Streamline workflows', icon: Clock },
                  { value: 'scale', label: 'Grow My Business', description: 'Expand operations', icon: BarChart3 }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setData({ 
                      ...data, 
                      goals: toggleArrayItem(data.goals, option.value)
                    })}
                    className={`relative flex items-start gap-4 p-5 rounded-xl border transition-all group hover:scale-105 ${
                      data.goals.includes(option.value)
                        ? 'bg-emerald-500/15 border-emerald-400 shadow-lg shadow-emerald-400/20'
                        : 'bg-emerald-900/20 border-emerald-400/30 hover:border-emerald-400/50 hover:bg-emerald-500/10'
                    }`}
                  >
                    <option.icon className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                    <div className="text-left flex-1">
                      <div className="font-medium text-white group-hover:text-emerald-100">{option.label}</div>
                      <div className="text-sm text-emerald-200/60 mt-1">{option.description}</div>
                    </div>
                    {data.goals.includes(option.value) && (
                      <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-400/10 rounded-full mb-4">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-300 font-medium">Equipment & Budget</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Let's talk equipment</h2>
                <p className="text-emerald-100/70">Tell us about your equipment interests and budget (we have $0 down options too!)</p>
              </div>

              <div>
                <label className="block text-lg font-medium text-emerald-100 mb-6">
                  What equipment interests you?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'led-lights', label: 'LED Grow Lights', icon: Sun },
                    { value: 'hvac', label: 'HVAC Systems', icon: Wind },
                    { value: 'sensors', label: 'Environmental Sensors', icon: Thermometer },
                    { value: 'irrigation', label: 'Irrigation Systems', icon: Droplets },
                    { value: 'automation', label: 'Automation Controls', icon: Zap },
                    { value: 'software', label: 'Software Only', icon: BarChart3 }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setData({ 
                        ...data, 
                        equipment: toggleArrayItem(data.equipment, option.value)
                      })}
                      className={`relative flex items-center gap-3 p-4 rounded-xl border transition-all group hover:scale-105 ${
                        data.equipment.includes(option.value)
                          ? 'bg-emerald-500/15 border-emerald-400 shadow-lg shadow-emerald-400/20'
                          : 'bg-emerald-900/20 border-emerald-400/30 hover:border-emerald-400/50 hover:bg-emerald-500/10'
                      }`}
                    >
                      <option.icon className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium text-white group-hover:text-emerald-100">{option.label}</span>
                      {data.equipment.includes(option.value) && (
                        <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium text-emerald-100 mb-4">
                    Equipment budget range
                  </label>
                  <select
                    value={data.budget}
                    onChange={(e) => setData({ ...data, budget: e.target.value })}
                    className="w-full px-4 py-3 bg-emerald-900/20 border border-emerald-400/30 rounded-xl text-white focus:border-emerald-400 focus:outline-none transition-colors"
                  >
                    <option value="" className="bg-gray-800">Select budget range</option>
                    <option value="0-50k" className="bg-gray-800">$0 - $50,000</option>
                    <option value="50k-100k" className="bg-gray-800">$50,000 - $100,000</option>
                    <option value="100k-250k" className="bg-gray-800">$100,000 - $250,000</option>
                    <option value="250k-500k" className="bg-gray-800">$250,000 - $500,000</option>
                    <option value="500k+" className="bg-gray-800">$500,000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-medium text-emerald-100 mb-4">
                    When are you looking to invest?
                  </label>
                  <select
                    value={data.timeline}
                    onChange={(e) => setData({ ...data, timeline: e.target.value })}
                    className="w-full px-4 py-3 bg-emerald-900/20 border border-emerald-400/30 rounded-xl text-white focus:border-emerald-400 focus:outline-none transition-colors"
                  >
                    <option value="" className="bg-gray-800">Select timeline</option>
                    <option value="immediate" className="bg-gray-800">Ready now</option>
                    <option value="1-3-months" className="bg-gray-800">1-3 months</option>
                    <option value="3-6-months" className="bg-gray-800">3-6 months</option>
                    <option value="6-12-months" className="bg-gray-800">6-12 months</option>
                    <option value="12-months+" className="bg-gray-800">Planning ahead (12+ months)</option>
                  </select>
                </div>
              </div>

              {/* Revenue Sharing Callout */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-6 border border-emerald-400/30 shadow-lg">
                <div className="flex items-start gap-4">
                  <DollarSign className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">$0 Down Equipment Program Available!</h3>
                    <p className="text-emerald-100/80">
                      No upfront capital? No problem! Our revenue sharing program connects you with investors 
                      who fund your equipment. You get the gear, they get a share of the increased revenue. Win-win!
                    </p>
                    <Link 
                      href="/equipment-board"
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 transition-colors rounded-lg hover:bg-emerald-500/30"
                    >
                      Tell me more <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-emerald-400/20">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 text-emerald-200/60 hover:text-white transition-colors hover:bg-emerald-500/10 rounded-lg"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading}
              className={`${step === 1 ? 'w-full' : 'ml-auto'} flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transform`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Setting up your personalized experience...
                </>
              ) : step === totalSteps ? (
                <>
                  Let's get growing!
                  <CheckCircle className="w-5 h-5" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}