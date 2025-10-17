'use client';

import Link from 'next/link';
import { useState } from 'react';
import { logger } from '@/lib/client-logger';
import { 
  Sparkles, 
  Award, 
  Users, 
  Lightbulb, 
  Target,
  ArrowRight,
  CheckCircle,
  Building,
  Leaf,
  Globe,
  BookOpen,
  Briefcase,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import { Timeline } from '@/components/about/Timeline';
import { SocialProof } from '@/components/about/SocialProof';
import { VideoSection } from '@/components/about/VideoSection';
import { StructuredData } from '@/components/about/StructuredData';
import { PressMentions } from '@/components/about/PressMentions';
import { AchievementsBadges } from '@/components/about/AchievementsBadges';
import { CallToAction } from '@/components/about/CallToAction';
import { LiveStatsDashboard } from '@/components/about/LiveStatsDashboard';

export default function AboutPage() {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  const founderPhotos = [
    { 
      src: '/founder/blake-profile.webp', 
      alt: 'Blake Lange CEO VibeLux - Controlled Environment Agriculture Leader',
      title: 'Blake Lange - Founder & CEO of VibeLux',
      description: 'Professional headshot of Blake Lange, VibeLux founder and horticultural lighting expert'
    },
    { 
      src: '/founder/blake-city-farming.webp', 
      alt: 'Blake Lange inspecting LED grow lights at City Farming vertical farm',
      title: 'VibeLux CEO at City Farming Facility',
      description: 'Blake Lange analyzing horticultural LED lighting systems in commercial vertical farming operation'
    },
    { 
      src: '/founder/blake-conference-2017.jpg', 
      alt: 'Blake Lange speaking at Indoor Agriculture Conference 2017 - CEA technology',
      title: 'Indoor Agriculture Conference 2017 Speaker',
      description: 'Blake Lange presenting on LED lighting innovation at major indoor farming conference'
    },
    { 
      src: '/founder/blake-1.jpeg', 
      alt: 'Blake Lange examining cannabis plants under LED grow lights',
      title: 'Horticultural Lighting Expert in Growing Facility',
      description: 'Blake Lange inspecting plant growth under optimized LED spectrum in commercial cultivation facility'
    },
    { 
      src: '/founder/blake-3.jpg', 
      alt: 'Blake Lange professional portrait - Greenhouse Product News 40 Under 40 Class of 2022',
      title: 'Blake Lange - GPN 40 Under 40 (2022)',
      description: 'Professional portrait of Blake Lange, named to Greenhouse Product News 40 Under 40 Class of 2022'
    },
    { 
      src: '/founder/farms-sustainable.webp', 
      alt: 'Sustainable vertical farming facility with LED lighting designed by VibeLux',
      title: 'Sustainable Agriculture Innovation',
      description: 'Modern vertical farming facility showcasing energy-efficient LED lighting systems for sustainable food production'
    },
    { 
      src: '/founder/blake-professional-1.jpg', 
      alt: 'Blake Lange consulting on commercial greenhouse lighting design',
      title: 'VibeLux CEO Consulting on Lighting Design',
      description: 'Blake Lange providing expert consultation on horticultural lighting optimization for commercial growers'
    },
    { 
      src: '/founder/blake-professional-2.jpg', 
      alt: 'Blake Lange networking at horticultural technology conference',
      title: 'Industry Leadership and Innovation',
      description: 'VibeLux founder Blake Lange at agricultural technology conference advancing controlled environment agriculture'
    },
    { 
      src: '/founder/blake-professional-3.jpg', 
      alt: 'Blake Lange in vertical farm analyzing PPFD measurements',
      title: 'Vertical Farming Technology Expert',
      description: 'Blake Lange measuring photosynthetic photon flux density (PPFD) in advanced vertical farming facility'
    },
    { 
      src: '/founder/blake-professional-4.jpg', 
      alt: 'Blake Lange demonstrating LED grow light technology to growers',
      title: 'Horticultural Lighting Education',
      description: 'VibeLux CEO Blake Lange educating commercial growers on optimizing LED lighting for maximum yields'
    }
  ];

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % founderPhotos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + founderPhotos.length) % founderPhotos.length);
  };

  return (
    <>
      <StructuredData />
      <MarketingNavigation />
      <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              About <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Vibelux</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Revolutionizing controlled environment agriculture through intelligent lighting design
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                At Vibelux, we're on a mission to empower growers with the most advanced horticultural 
                lighting design platform in the industry. We believe that optimal light is the key to 
                sustainable, profitable indoor agriculture.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Our comprehensive platform combines cutting-edge science, intuitive design tools, and 
                data-driven insights to help growers of all sizes maximize yields while minimizing 
                energy costs.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur p-6 rounded-2xl border border-white/10">
                <Target className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">Precision</h3>
                <p className="text-gray-400 text-sm">Scientific accuracy in every calculation</p>
              </div>
              <div className="bg-white/5 backdrop-blur p-6 rounded-2xl border border-white/10">
                <Leaf className="w-10 h-10 text-green-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">Sustainability</h3>
                <p className="text-gray-400 text-sm">Reduce energy use and carbon footprint</p>
              </div>
              <div className="bg-white/5 backdrop-blur p-6 rounded-2xl border border-white/10">
                <Users className="w-10 h-10 text-blue-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">Accessibility</h3>
                <p className="text-gray-400 text-sm">Tools for hobbyists to mega-farms</p>
              </div>
              <div className="bg-white/5 backdrop-blur p-6 rounded-2xl border border-white/10">
                <Lightbulb className="w-10 h-10 text-yellow-400 mb-4" />
                <h3 className="text-white font-semibold mb-2">Innovation</h3>
                <p className="text-gray-400 text-sm">Cutting-edge features and AI tools</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Meet Our Founder</h2>
            <p className="text-xl text-gray-400">Visionary leadership in agricultural technology</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Left Column - Profile with Photo Gallery */}
              <div className="text-center space-y-4">
                <div className="relative w-full max-w-sm mx-auto">
                  {/* Photo Gallery */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-900">
                    <img
                      src={founderPhotos[currentPhotoIndex].src}
                      alt={founderPhotos[currentPhotoIndex].alt}
                      title={founderPhotos[currentPhotoIndex].title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        logger.error('system', `Image failed to load: ${founderPhotos[currentPhotoIndex].src}`);
                        setImageErrors(prev => new Set(prev).add(founderPhotos[currentPhotoIndex].src));
                      }}
                    />
                    
                    {/* Navigation Buttons */}
                    <button
                      onClick={prevPhoto}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    {/* Photo Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {founderPhotos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPhotoIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentPhotoIndex ? 'bg-white w-8' : 'bg-white/50'
                          }`}
                          aria-label={`Go to photo ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Photo Caption */}
                  <p className="text-sm text-gray-400 mt-2">
                    {currentPhotoIndex + 1} / {founderPhotos.length} - {founderPhotos[currentPhotoIndex].description}
                  </p>
                </div>
                
                <h3 className="text-2xl font-bold text-white">Blake Lange</h3>
                <p className="text-purple-400 font-medium">Founder & CEO</p>
                <p className="text-gray-400 text-sm">@hortlightguy</p>
                <div className="flex justify-center gap-4 mt-4">
                  <a href="https://www.linkedin.com/in/blakelange/" target="_blank" rel="noopener noreferrer" 
                     className="text-gray-400 hover:text-white transition-colors"
                     aria-label="LinkedIn Profile">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                  <a href="https://www.youtube.com/@hortlightguy" target="_blank" rel="noopener noreferrer" 
                     className="text-gray-400 hover:text-white transition-colors"
                     aria-label="YouTube Channel">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                  <a href="https://www.instagram.com/hortlightguy" target="_blank" rel="noopener noreferrer" 
                     className="text-gray-400 hover:text-white transition-colors"
                     aria-label="Instagram Profile">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Right Columns - Bio and Achievements */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h4 className="text-xl font-semibold text-white mb-3">Pioneering Controlled Environment Agriculture</h4>
                  <p className="text-gray-300 leading-relaxed">
                    Blake Lange is a recognized leader in controlled environment agriculture (CEA) and 
                    horticultural lighting technology. With a unique blend of technical expertise and 
                    entrepreneurial vision, Blake founded Vibelux to democratize access to professional-grade 
                    lighting design tools.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-white mb-3">Professional Background</h4>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Currently serving at Signify (formerly Philips Lighting), Blake brings deep industry experience in LED technology 
                    and sustainable agriculture. With a BS in Entrepreneurship from University of Illinois Chicago and extensive 
                    professional certifications, his work focuses on advancing the science of photobiology and making sophisticated lighting 
                    calculations accessible to growers at every scale.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">
                        <span className="font-medium text-white">Industry Recognition:</span> Named to Greenhouse Product News 
                        40 Under 40 Class of 2022, honoring young leaders shaping the future of horticulture
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">
                        <span className="font-medium text-white">Industry Leadership:</span> Active member of the Global 
                        CEA Consortium (GCEAC) Sustainability Committee and Resource Innovation Institute's CEA Leadership Committee
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">
                        <span className="font-medium text-white">Government Collaboration:</span> Contributed to USDA 
                        Specialty Crop Research Initiative's Economics Group, advancing agricultural innovation
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">
                        <span className="font-medium text-white">Thought Leadership:</span> Invited speaker for 
                        "Holland on the Hill" program, sharing insights on agricultural technology and sustainability
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-300">
                        <span className="font-medium text-white">Space Agriculture Research:</span> Co-authored 
                        <a href="https://www.greenhousegrower.com/technology/philips-lighting-and-university-of-arizona-study-shows-led-systems-ideal-for-growing-food-in-space/" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-purple-400 hover:text-purple-300 underline">
                          groundbreaking study with University of Arizona
                        </a> demonstrating LED systems for growing food in space
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-purple-400" />
                      Certifications
                    </h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• Certified Horticulturist (ASHS)</li>
                      <li>• LED Professional Certifications (Philips)</li>
                      <li>• Solution Selling Certified</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Building className="w-5 h-5 text-purple-400" />
                      Professional Memberships
                    </h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• American Society of Agricultural Engineers</li>
                      <li>• International Society for Horticultural Science</li>
                      <li>• Illuminating Engineering Society</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-600/10 border border-purple-600/20 rounded-xl p-6">
                  <p className="text-purple-300 italic">
                    "My vision for Vibelux is to empower every grower – from hobbyists to commercial operations – 
                    with the same sophisticated tools used by industry leaders. By combining scientific rigor with 
                    intuitive design, we're making professional lighting optimization accessible to all."
                  </p>
                  <p className="text-purple-400 font-medium mt-3">- Blake Lange, Founder & CEO</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <Timeline />

      {/* Social Proof Section */}
      <SocialProof />

      {/* Live Statistics Dashboard */}
      <LiveStatsDashboard />

      {/* Video Section */}
      <VideoSection />

      {/* Press Mentions */}
      <PressMentions />

      {/* Achievements Badges */}
      <AchievementsBadges />

      {/* Photo Gallery Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Through the Years</h2>
            <p className="text-xl text-gray-400">Building the future of agriculture, one innovation at a time</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {founderPhotos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                   onClick={() => setCurrentPhotoIndex(index)}>
                <img
                  src={photo.src}
                  alt={photo.alt}
                  title={photo.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    logger.warn('system', 'Gallery image failed to load:', { data: photo.src });
                    setImageErrors(prev => new Set(prev).add(photo.src));
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                
                {/* Photo number indicator */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          
          {/* Gallery description */}
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              Click any photo to view in the carousel above • {founderPhotos.length} photos showcasing Blake's journey in agricultural technology
            </p>
          </div>
        </div>
      </section>

      {/* Community Impact */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Beyond Technology</h2>
            <p className="text-xl text-gray-400">Committed to community and sustainable agriculture</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur p-8 rounded-2xl border border-white/10">
              <Globe className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Global Impact</h3>
              <p className="text-gray-300">
                Working with international organizations to advance sustainable agriculture and food security 
                through innovative lighting solutions.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur p-8 rounded-2xl border border-white/10">
              <Users className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Community Leadership</h3>
              <p className="text-gray-300">
                Active in local community as a youth sports coach and parks advisory committee member, 
                fostering the next generation of leaders.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur p-8 rounded-2xl border border-white/10">
              <BookOpen className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Knowledge Sharing</h3>
              <p className="text-gray-300">
                Regular speaker and educator, committed to democratizing agricultural technology knowledge 
                across the industry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <CallToAction />
    </div>
    <Footer />
    </>
  );
}