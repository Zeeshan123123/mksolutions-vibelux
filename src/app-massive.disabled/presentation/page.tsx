'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Home, Menu, X } from 'lucide-react';

// Import all slide components
import { TitleSlide } from '@/components/presentation/slides/TitleSlide';
import { AgendaSlide } from '@/components/presentation/slides/AgendaSlide';
import { ProblemSlide } from '@/components/presentation/slides/ProblemSlide';
import { SolutionOverviewSlide } from '@/components/presentation/slides/SolutionOverviewSlide';
import { PlatformFeaturesSlide } from '@/components/presentation/slides/PlatformFeaturesSlide';
import { DesignToolsSlide } from '@/components/presentation/slides/DesignToolsSlide';
import { AnalyticsSlide } from '@/components/presentation/slides/AnalyticsSlide';
import { AutomationSlide } from '@/components/presentation/slides/AutomationSlide';
import { DLCDatabaseSlide } from '@/components/presentation/slides/DLCDatabaseSlide';
import { ROISlide } from '@/components/presentation/slides/ROISlide';
import { CaseStudiesSlide } from '@/components/presentation/slides/CaseStudiesSlide';
import { CompetitiveAdvantageSlide } from '@/components/presentation/slides/CompetitiveAdvantageSlide';
import { PricingSlide } from '@/components/presentation/slides/PricingSlide';
import { RoadmapSlide } from '@/components/presentation/slides/RoadmapSlide';
import { DemoSlide } from '@/components/presentation/slides/DemoSlide';
import { CTASlide } from '@/components/presentation/slides/CTASlide';

const slides = [
  // Section 1: Introduction (10 slides)
  { component: TitleSlide, title: "VibeLux - Professional Horticultural Lighting Platform", section: "Introduction" },
  { component: AgendaSlide, title: "What We'll Cover Today", section: "Introduction" },
  { component: ProblemSlide, title: "The Challenge: Growing Complexity in Controlled Environment Agriculture", section: "Introduction" },
  { component: SolutionOverviewSlide, title: "VibeLux: Your Complete CEA Technology Partner", section: "Introduction" },
  { component: PlatformFeaturesSlide, title: "Platform Overview: Everything You Need in One Place", section: "Introduction" },
  
  // Section 2: Core Features Deep Dive (25 slides)
  { component: DesignToolsSlide, title: "3D Design Studio: Professional Lighting Design Made Simple", section: "Core Features" },
  { component: AnalyticsSlide, title: "Advanced Analytics: Data-Driven Growing Decisions", section: "Core Features" },
  { component: AutomationSlide, title: "Automation Hub: Complete Facility Control", section: "Core Features" },
  { component: DLCDatabaseSlide, title: "DLC Database: 2,400+ Certified Fixtures at Your Fingertips", section: "Core Features" },
  
  // Section 3: Business Value (15 slides)
  { component: ROISlide, title: "Proven ROI: Real Results from Real Customers", section: "Business Value" },
  { component: CaseStudiesSlide, title: "Success Stories: How Our Customers Save 20-40% on Energy", section: "Business Value" },
  { component: CompetitiveAdvantageSlide, title: "Why VibeLux Leads the Market", section: "Business Value" },
  
  // Section 4: Commercial & Next Steps (10 slides)
  { component: PricingSlide, title: "Flexible Pricing: Solutions for Every Scale", section: "Commercial" },
  { component: RoadmapSlide, title: "Innovation Pipeline: What's Coming Next", section: "Commercial" },
  { component: DemoSlide, title: "See VibeLux in Action", section: "Commercial" },
  { component: CTASlide, title: "Ready to Transform Your Operation?", section: "Commercial" },
];

// Generate additional slides to reach 60 total
const additionalSlides = [
  // Technical Deep Dives
  { component: () => <TechnicalSlide title="Spectrum Analysis Engine" content="Advanced PAR curve analysis and spectral optimization" />, title: "Spectrum Analysis Engine", section: "Technical" },
  { component: () => <TechnicalSlide title="CFD Simulation" content="Computational fluid dynamics for optimal airflow design" />, title: "CFD Simulation", section: "Technical" },
  { component: () => <TechnicalSlide title="Energy Optimization" content="AI-powered energy management and cost reduction" />, title: "Energy Optimization", section: "Technical" },
  { component: () => <TechnicalSlide title="Multi-Facility Management" content="Centralized control across multiple growing locations" />, title: "Multi-Facility Management", section: "Technical" },
  { component: () => <TechnicalSlide title="API Integration" content="Connect with your existing systems seamlessly" />, title: "API Integration", section: "Technical" },
  
  // Market & Industry
  { component: () => <MarketSlide title="Cannabis Market Opportunity" content="$45B market growing at 25% annually" />, title: "Cannabis Market", section: "Market" },
  { component: () => <MarketSlide title="Vertical Farming Growth" content="$8B market expected to reach $24B by 2030" />, title: "Vertical Farming", section: "Market" },
  { component: () => <MarketSlide title="Greenhouse Technology Trends" content="Smart agriculture driving $20B+ investment" />, title: "Greenhouse Tech", section: "Market" },
  
  // Customer Segments
  { component: () => <CustomerSlide title="Cannabis Cultivators" content="Optimize yield and compliance for commercial grows" />, title: "Cannabis Cultivators", section: "Customers" },
  { component: () => <CustomerSlide title="Vertical Farms" content="Maximize efficiency in controlled environments" />, title: "Vertical Farms", section: "Customers" },
  { component: () => <CustomerSlide title="Research Institutions" content="Precision tools for agricultural research" />, title: "Research Institutions", section: "Customers" },
  { component: () => <CustomerSlide title="Equipment Manufacturers" content="Partner with VibeLux for complete solutions" />, title: "Equipment Manufacturers", section: "Customers" },
  
  // Features Showcase
  { component: () => <FeatureSlide title="Real-Time Monitoring" content="Live data from sensors across your facility" />, title: "Real-Time Monitoring", section: "Features" },
  { component: () => <FeatureSlide title="Predictive Analytics" content="AI forecasts to optimize growing conditions" />, title: "Predictive Analytics", section: "Features" },
  { component: () => <FeatureSlide title="Compliance Reporting" content="Automated documentation for regulatory requirements" />, title: "Compliance Reporting", section: "Features" },
  { component: () => <FeatureSlide title="Mobile Access" content="Control your facility from anywhere" />, title: "Mobile Access", section: "Features" },
  
  // Success Metrics
  { component: () => <MetricSlide title="Customer Success Metrics" metric="95%" description="Customer satisfaction rate" />, title: "Customer Success", section: "Metrics" },
  { component: () => <MetricSlide title="Energy Savings" metric="30%" description="Average energy cost reduction" />, title: "Energy Savings", section: "Metrics" },
  { component: () => <MetricSlide title="Yield Improvement" metric="25%" description="Average yield increase" />, title: "Yield Improvement", section: "Metrics" },
  { component: () => <MetricSlide title="Time to ROI" metric="6 months" description="Average payback period" />, title: "Time to ROI", section: "Metrics" },
  
  // Technology Stack
  { component: () => <TechStackSlide title="Cloud Infrastructure" content="Enterprise-grade security and reliability" />, title: "Cloud Infrastructure", section: "Technology" },
  { component: () => <TechStackSlide title="Machine Learning" content="Continuous optimization through AI" />, title: "Machine Learning", section: "Technology" },
  { component: () => <TechStackSlide title="IoT Integration" content="Connect any sensor or device" />, title: "IoT Integration", section: "Technology" },
  
  // Implementation
  { component: () => <ImplementationSlide title="Onboarding Process" content="5-step process to get you up and running" />, title: "Onboarding Process", section: "Implementation" },
  { component: () => <ImplementationSlide title="Training & Support" content="Comprehensive training and 24/7 support" />, title: "Training & Support", section: "Implementation" },
  { component: () => <ImplementationSlide title="Data Migration" content="Seamless transfer of your existing data" />, title: "Data Migration", section: "Implementation" },
  
  // Partnership Opportunities
  { component: () => <PartnerSlide title="Become a VibeLux Partner" content="Join our growing ecosystem" />, title: "Partnership Program", section: "Partnerships" },
  { component: () => <PartnerSlide title="Integration Partners" content="Connect your products with VibeLux" />, title: "Integration Partners", section: "Partnerships" },
  { component: () => <PartnerSlide title="Reseller Program" content="Sell VibeLux to your customers" />, title: "Reseller Program", section: "Partnerships" },
  
  // Final slides
  { component: () => <ContactSlide title="Get Started Today" content="Contact our team for a personalized demo" />, title: "Contact Us", section: "Next Steps" },
  { component: () => <ThankYouSlide title="Thank You" content="Questions & Discussion" />, title: "Thank You", section: "Conclusion" },
];

const allSlides = [...slides, ...additionalSlides].slice(0, 60);

// Slide component templates
function TechnicalSlide({ title, content }: { title: string; content: string }) {
  return (
    <div className="h-full flex flex-col justify-center items-center p-12 bg-gradient-to-br from-blue-900 to-purple-900">
      <h1 className="text-5xl font-bold text-white mb-8">{title}</h1>
      <p className="text-2xl text-blue-200 text-center max-w-4xl">{content}</p>
    </div>
  );
}

function MarketSlide({ title, content }: { title: string; content: string }) {
  return (
    <div className="h-full flex flex-col justify-center items-center p-12 bg-gradient-to-br from-green-900 to-teal-900">
      <h1 className="text-5xl font-bold text-white mb-8">{title}</h1>
      <p className="text-2xl text-green-200 text-center max-w-4xl">{content}</p>
    </div>
  );
}

function CustomerSlide({ title, content }: { title: string; content: string }) {
  return (
    <div className="h-full flex flex-col justify-center items-center p-12 bg-gradient-to-br from-purple-900 to-pink-900">
      <h1 className="text-5xl font-bold text-white mb-8">{title}</h1>
      <p className="text-2xl text-purple-200 text-center max-w-4xl">{content}</p>
    </div>
  );
}

function FeatureSlide({ title, content }: { title: string; content: string }) {
  return (
    <div className="h-full flex flex-col justify-center items-center p-12 bg-gradient-to-br from-indigo-900 to-blue-900">
      <h1 className="text-5xl font-bold text-white mb-8">{title}</h1>
      <p className="text-2xl text-indigo-200 text-center max-w-4xl">{content}</p>
    </div>
  );
}

function MetricSlide({ title, metric, description }: { title: string; metric: string; description: string }) {
  return (
    <div className="h-full flex flex-col justify-center items-center p-12 bg-gradient-to-br from-orange-900 to-red-900">
      <h1 className="text-4xl font-bold text-white mb-8">{title}</h1>
      <div className="text-8xl font-bold text-orange-300 mb-4">{metric}</div>
      <p className="text-2xl text-orange-200 text-center">{description}</p>
    </div>
  );
}

function TechStackSlide({ title, content }: { title: string; content: string }) {
  return (
    <div className="h-full flex flex-col justify-center items-center p-12 bg-gradient-to-br from-gray-900 to-slate-900">
      <h1 className="text-5xl font-bold text-white mb-8">{title}</h1>
      <p className="text-2xl text-gray-200 text-center max-w-4xl">{content}</p>
    </div>
  );
}

function ImplementationSlide({ title, content }: { title: string; content: string }) {
  return (
    <div className="h-full flex flex-col justify-center items-center p-12 bg-gradient-to-br from-cyan-900 to-blue-900">
      <h1 className="text-5xl font-bold text-white mb-8">{title}</h1>
      <p className="text-2xl text-cyan-200 text-center max-w-4xl">{content}</p>
    </div>
  );
}

function PartnerSlide({ title, content }: { title: string; content: string }) {
  return (
    <div className="h-full flex flex-col justify-center items-center p-12 bg-gradient-to-br from-emerald-900 to-green-900">
      <h1 className="text-5xl font-bold text-white mb-8">{title}</h1>
      <p className="text-2xl text-emerald-200 text-center max-w-4xl">{content}</p>
    </div>
  );
}

function ContactSlide({ title, content }: { title: string; content: string }) {
  return (
    <div className="h-full flex flex-col justify-center items-center p-12 bg-gradient-to-br from-violet-900 to-purple-900">
      <h1 className="text-5xl font-bold text-white mb-8">{title}</h1>
      <p className="text-2xl text-violet-200 text-center max-w-4xl mb-12">{content}</p>
      <div className="text-xl text-white">
        <p>📧 hello@vibelux.ai</p>
        <p>🌐 www.vibelux.ai</p>
        <p>📱 Schedule a Demo</p>
      </div>
    </div>
  );
}

function ThankYouSlide({ title, content }: { title: string; content: string }) {
  return (
    <div className="h-full flex flex-col justify-center items-center p-12 bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="text-8xl font-bold mb-12">
        <span className="text-purple-200">Vibe</span>
        <span className="text-cyan-200">Lux</span>
      </div>
      <h1 className="text-6xl font-bold text-white mb-8">{title}</h1>
      <p className="text-3xl text-purple-200 text-center">{content}</p>
    </div>
  );
}

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'Escape') {
        setShowMenu(!showMenu);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, showMenu]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % allSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + allSlides.length) % allSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setShowMenu(false);
  };

  const CurrentSlideComponent = allSlides[currentSlide].component;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Current Slide */}
      <div className="w-full h-full">
        <CurrentSlideComponent />
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
        <button
          onClick={prevSlide}
          className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4">
          <span className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {currentSlide + 1} / {allSlides.length}
          </span>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        <button
          onClick={nextSlide}
          className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
          disabled={currentSlide === allSlides.length - 1}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Slide Menu */}
      {showMenu && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Slide Navigation</h2>
              <button
                onClick={() => setShowMenu(false)}
                className="p-2 text-white hover:bg-white/20 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allSlides.map((slide, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`p-4 rounded-lg text-left transition-colors ${
                    index === currentSlide
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="text-sm text-gray-400 mb-1">Slide {index + 1}</div>
                  <div className="font-medium text-sm">{slide.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{slide.section}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-black/20">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / allSlides.length) * 100}%` }}
        />
      </div>
    </div>
  );
}