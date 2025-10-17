'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Footer } from '@/components/Footer';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';

export default function AboutPage() {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Reset error state when photo index changes
  useEffect(() => {
    if (mounted) {
      setImageError(false);
      setImageLoading(true);
    }
  }, [currentPhotoIndex, mounted]);
  
  // Founder photo gallery
  const founderInfo = [
    {
      title: 'Blake Lange - Founder & CEO',
      description: 'Technology Innovation Leader',
      image: '/founder/blake-1.jpeg'
    },
    {
      title: 'Industry Leadership',
      description: 'CEA Expertise & Recognition',
      image: '/founder/blake-3.jpg'
    },
    {
      title: 'Urban Agriculture',
      description: 'Smart City & Controlled Environment',
      image: '/founder/blake-city-farming.webp'
    }
  ];

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % founderInfo.length);
    setImageError(false); // Reset error state when changing images
    setImageLoading(true); // Reset loading state when changing images
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + founderInfo.length) % founderInfo.length);
    setImageError(false); // Reset error state when changing images
    setImageLoading(true); // Reset loading state when changing images
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-black">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-transparent to-transparent" />
          
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-white">
                About <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">VibeLux</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                The Complete CEA Platform - From Design to Harvest to Market
              </p>
              <div className="mt-8">
                <p className="text-2xl font-semibold text-purple-400">
                  "Empowering growers to unlock the future of agriculture through intelligent technology"
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Simple Photo Gallery */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Meet Our Founder</h2>
              <p className="text-xl text-gray-400">Blake Lange, Founder & CEO</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="text-center space-y-6">
                <div className="relative w-full max-w-96 aspect-square mx-auto">
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
                    {/* Loading indicator */}
                    {imageLoading && !imageError && (
                      <div className="absolute inset-0 bg-gray-800 flex items-center justify-center z-10">
                        <div className="text-white text-center">
                          <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                          <div className="text-sm opacity-90">Loading image...</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Founder Photo or Fallback */}
                    {!imageError ? (
                      <Image
                        src={founderInfo[currentPhotoIndex].image}
                        alt={founderInfo[currentPhotoIndex].title}
                        fill
                        className="object-cover"
                        priority={currentPhotoIndex === 0}
                        sizes="(max-width: 768px) 100vw, 384px"
                        onError={(e) => {
                          console.error('Image failed to load:', founderInfo[currentPhotoIndex].image);
                          handleImageError();
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', founderInfo[currentPhotoIndex].image);
                          setImageLoading(false);
                        }}
                      />
                    ) : (
                      // Fallback gradient avatar if image fails to load
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-6xl font-bold mb-2">BL</div>
                          <div className="text-sm opacity-90">Blake Lange</div>
                          <div className="text-xs opacity-75 mt-1">Founder & CEO</div>
                        </div>
                      </div>
                    )}
                    
                    {/* Overlay for text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Text overlay */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="text-lg font-semibold mb-1">Blake Lange</div>
                      <div className="text-sm opacity-90">Founder & CEO</div>
                      <div className="text-xs opacity-75 mt-1">{founderInfo[currentPhotoIndex].description}</div>
                    </div>
                    
                    {/* Navigation Buttons */}
                    <button
                      onClick={prevPhoto}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                      aria-label="Previous view"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                      aria-label="Next view"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    {/* View Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {founderInfo.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentPhotoIndex(index);
                            setImageError(false);
                            setImageLoading(true);
                          }}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentPhotoIndex ? 'bg-white w-8' : 'bg-white/50'
                          }`}
                          aria-label={`View ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">{founderInfo[currentPhotoIndex].title}</h3>
                  <p className="text-purple-400 font-medium">{founderInfo[currentPhotoIndex].description}</p>
                  <p className="text-gray-300 max-w-2xl mx-auto">
                    Blake Lange has designed over 1,000 unique lighting systems throughout his career, spending countless hours 
                    on each custom design. Named to Greenhouse Product News 40 Under 40 Class of 2022, Blake brings deep 
                    industry experience from Signify (formerly Philips Lighting) to solve the industry's biggest challenges.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem & Vision */}
        <section className="py-20 bg-gray-900/30">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6">The Vision</h2>
              <p className="text-2xl text-purple-400 font-semibold mb-8">
                "Understanding how light tweaks plants to unlock unprecedented agricultural potential"
              </p>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                VibeLux exists to solve the fundamental disconnects in controlled environment agriculture and 
                create the world's first truly unified platform for CEA operations - from design to harvest to market.
              </p>
            </div>
          </div>
        </section>

        {/* Blake's Story & The Problems */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">The Problems Blake Saw</h2>
                <div className="space-y-6">
                  <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-red-400 mb-3">1,000+ Manual Designs</h3>
                    <p className="text-gray-300">
                      After designing over 1,000 unique lighting systems - each taking countless hours to perfect - Blake dreamed of 
                      having an AI agent that could automate this process. That dream is now reality with VibeLux's AI design assistant.
                    </p>
                  </div>
                  <div className="bg-orange-900/20 border border-orange-700/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-orange-400 mb-3">Heat in Controlled Environments</h3>
                    <p className="text-gray-300">
                      As a lighting designer, you're putting heat into a controlled environment. CFD analysis became essential to understand 
                      climate uniformity and airflow - especially critical in vertical farming operations.
                    </p>
                  </div>
                  <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-yellow-400 mb-3">Incomplete Electrical Systems</h3>
                    <p className="text-gray-300">
                      Light plans consistently left off the full electrical system needed to power them, leaving customers and contractors 
                      to figure it out. There had to be a simpler, more complete way.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">More Industry Disconnects</h2>
                <div className="space-y-6">
                  <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-blue-400 mb-3">Data Silos Everywhere</h3>
                    <p className="text-gray-300">
                      Too many disconnected systems, data trapped in silos. The industry needed everything integrated into one unified platform.
                    </p>
                  </div>
                  <div className="bg-purple-900/20 border border-purple-700/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-purple-400 mb-3">Complex Building Codes</h3>
                    <p className="text-gray-300">
                      Construction projects constantly struggled with difficult-to-understand building codes and compliance requirements.
                    </p>
                  </div>
                  <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-green-400 mb-3">Missing IES Files</h3>
                    <p className="text-gray-300">
                      No public IES files available made it nearly impossible to compare luminaires against each other effectively.
                    </p>
                  </div>
                  <div className="bg-indigo-900/20 border border-indigo-700/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-indigo-400 mb-3">Labor & Market Access</h3>
                    <p className="text-gray-300">
                      No tools for labor optimization, small farms couldn't access large buyers like GFS or US Foods, and produce sales lacked proper marketplace connection.
                    </p>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-blue-400 mb-3">Rising Energy Costs</h3>
                    <p className="text-gray-300">
                      Energy costs are rapidly increasing across agricultural regions. Growers need intelligent tools to optimize energy usage, reduce peak demand charges, and maintain profitability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Solution */}
        <section className="py-20 bg-gray-900/50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-6">The VibeLux Solution</h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-8">
                VibeLux solves these disconnects with the world's first truly end-to-end CEA platform. We've built 2,400+ features 
                to address every aspect of controlled environment agriculture.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Core Mission</h3>
                <p className="text-gray-300 text-lg mb-6">
                  Revolutionizing controlled environment agriculture through unified technology that connects every aspect 
                  of growing operations - from initial design through harvest to final market sale.
                </p>
                <h3 className="text-2xl font-bold text-white mb-6 mt-8">Core Values</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="text-white font-semibold">Innovation</h4>
                      <p className="text-gray-400">Pioneering AI-driven solutions that automate complex agricultural processes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="text-white font-semibold">Sustainability</h4>
                      <p className="text-gray-400">Reducing grid load and energy consumption as AI demands increase and energy costs rise</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="text-white font-semibold">Unity</h4>
                      <p className="text-gray-400">Breaking down data silos to create one unified platform for all CEA operations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="text-white font-semibold">Empowerment</h4>
                      <p className="text-gray-400">Enabling small farms to compete with large organizations through technology</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="text-white font-semibold">Discovery</h4>
                      <p className="text-gray-400">Understanding how light spectrum correlates with plant outcomes like THC, biomass, proteins, and vitamins</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-purple-900/20 border border-purple-700/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Platform Impact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">1,000+</div>
                      <div className="text-sm text-gray-400">Lighting Designs by Blake</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">2,400+</div>
                      <div className="text-sm text-gray-400">Platform Features</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">8+</div>
                      <div className="text-sm text-gray-400">Beta Facilities</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">Beta</div>
                      <div className="text-sm text-gray-400">Testing Phase</div>
                    </div>
                  </div>
                </div>
                <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">The Future Vision</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <span className="text-gray-300 text-sm">Correlate light spectra with plant outcomes while minimizing energy usage</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <span className="text-gray-300 text-sm">Enable growers to monetize sustainable, energy-efficient growth strategies</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <span className="text-gray-300 text-sm">Connect small farms to major distributors with carbon-neutral operations</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                      <span className="text-gray-300 text-sm">Create sustainable marketplace prioritizing energy-efficient producers</span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Recognition</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300">Greenhouse Product News 40 Under 40</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300">Former Signify (Philips) Leadership</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300">1,000+ Unique Lighting System Designs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* End-to-End Platform */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Complete CEA Ecosystem</h2>
              <p className="text-gray-400 text-lg max-w-3xl mx-auto">
                The world's first truly end-to-end platform connecting every aspect of controlled environment agriculture
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-600/30 rounded-xl p-6">
                <div className="w-12 h-12 bg-blue-600 rounded-lg mb-4"></div>
                <h3 className="text-lg font-bold text-white mb-3">Design & Engineering</h3>
                <p className="text-gray-400 text-sm">
                  AI-powered lighting design, CFD analysis, electrical systems, and building code compliance
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-600/30 rounded-xl p-6">
                <div className="w-12 h-12 bg-green-600 rounded-lg mb-4"></div>
                <h3 className="text-lg font-bold text-white mb-3">Growth & Research</h3>
                <p className="text-gray-400 text-sm">
                  Recipe development, light spectrum correlation, labor optimization, and yield prediction
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-600/30 rounded-xl p-6">
                <div className="w-12 h-12 bg-purple-600 rounded-lg mb-4"></div>
                <h3 className="text-lg font-bold text-white mb-3">Operations & Control</h3>
                <p className="text-gray-400 text-sm">
                  Complete facility automation, environmental control, and industrial system integration
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-600/30 rounded-xl p-6">
                <div className="w-12 h-12 bg-orange-600 rounded-lg mb-4"></div>
                <h3 className="text-lg font-bold text-white mb-3">Market & Distribution</h3>
                <p className="text-gray-400 text-sm">
                  Buyer-seller marketplace, distributor connections, and recipe monetization platform
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Energy & Sustainability */}
        <section className="py-20 bg-gradient-to-br from-blue-900/30 to-green-900/30">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-6">Energy Optimization</h2>
              <p className="text-2xl text-blue-400 font-semibold mb-8">
                "Rising energy costs demand smarter agriculture technology"
              </p>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                Energy costs are rising rapidly across agricultural regions. VibeLux leverages AI to optimize energy usage, 
                reduce peak demand charges, and maximize efficiency while maintaining optimal growing conditions.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-black/30 rounded-xl p-6 border border-orange-600/30">
                <h3 className="text-xl font-bold text-orange-400 mb-4">The Challenge</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>• Rising energy costs in agricultural regions</li>
                  <li>• Expensive peak demand charges</li>
                  <li>• Inefficient lighting and climate systems</li>
                  <li>• Limited energy monitoring and control</li>
                </ul>
              </div>
              <div className="bg-black/30 rounded-xl p-6 border border-blue-600/30">
                <h3 className="text-xl font-bold text-blue-400 mb-4">Smart Solutions</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>• AI-powered energy optimization</li>
                  <li>• Peak demand avoidance strategies</li>
                  <li>• Intelligent lighting control systems</li>
                  <li>• Real-time energy monitoring</li>
                </ul>
              </div>
              <div className="bg-black/30 rounded-xl p-6 border border-green-600/30">
                <h3 className="text-xl font-bold text-green-400 mb-4">Benefits</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>• Reduced operational energy costs</li>
                  <li>• Renewable energy integration</li>
                  <li>• Optimized facility performance</li>
                  <li>• Future-ready infrastructure</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* The Breakthrough */}
        <section className="py-20 bg-gradient-to-br from-purple-900/30 to-blue-900/30">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">The Scientific Breakthrough</h2>
            <p className="text-2xl text-purple-400 font-semibold mb-8">
              "For the first time, we can understand exactly how light tweaks plants"
            </p>
            <p className="text-xl text-gray-300 mb-8">
              VibeLux enables unprecedented correlation between light spectra and plant outcomes - THC content, 
              biomass production, protein levels, vitamin content, and more. This breakthrough allows growers to 
              optimize their growth strategies and monetize their unique recipes while minimizing energy consumption.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="bg-black/30 rounded-xl p-6 border border-purple-600/30">
                <h3 className="text-xl font-bold text-white mb-4">Scientific Precision</h3>
                <p className="text-gray-300">
                  Track exact correlations between light spectrum, intensity, timing, and specific plant metabolite production with minimal energy waste
                </p>
              </div>
              <div className="bg-black/30 rounded-xl p-6 border border-purple-600/30">
                <h3 className="text-xl font-bold text-white mb-4">Sustainable Monetization</h3>
                <p className="text-gray-300">
                  Growers can patent, license, and sell optimized growth strategies as proven, energy-efficient recipes
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Beta Program */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Join Our Beta Program</h2>
            <p className="text-gray-400 text-lg mb-8">
              We're working with 8+ commercial facilities to develop and test our comprehensive platform. 
              Join our beta program to get early access and help shape the future of VibeLux.
            </p>
            <div className="bg-gray-900/50 rounded-xl p-8 mb-8">
              <h3 className="text-xl font-bold text-white mb-4">Beta Program Benefits</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="text-left">
                      <h4 className="text-white font-semibold">Early Access</h4>
                      <p className="text-gray-400 text-sm">Get first access to new features and tools</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="text-left">
                      <h4 className="text-white font-semibold">Free Energy Savings</h4>
                      <p className="text-gray-400 text-sm">Immediate access to our revenue-sharing program</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="text-left">
                      <h4 className="text-white font-semibold">Priority Support</h4>
                      <p className="text-gray-400 text-sm">Direct access to our development team</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="text-left">
                      <h4 className="text-white font-semibold">Custom Features</h4>
                      <p className="text-gray-400 text-sm">Request features specific to your operation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="text-left">
                      <h4 className="text-white font-semibold">Beta Pricing</h4>
                      <p className="text-gray-400 text-sm">Locked-in pricing when we launch</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="text-left">
                      <h4 className="text-white font-semibold">Shape the Future</h4>
                      <p className="text-gray-400 text-sm">Your feedback drives our development</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact"
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Join Beta Program
              </Link>
              <Link 
                href="/pricing"
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}