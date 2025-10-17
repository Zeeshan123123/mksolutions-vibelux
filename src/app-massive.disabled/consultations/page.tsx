'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  consultationCategories, 
  getAverageRateByCategory,
  categoryColors 
} from '@/lib/consultation-categories'
import { 
  Search,
  Clock,
  DollarSign,
  Star,
  Users,
  BookOpen,
  Filter,
  ArrowRight,
  Calendar,
  Video,
  Shield,
  CheckCircle
} from 'lucide-react'

export default function ConsultationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedExpertise, setSelectedExpertise] = useState<string | null>(null)

  // Filter categories based on search
  const filteredCategories = consultationCategories.filter(category => {
    const matchesSearch = !searchQuery || 
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.subcategories.some(sub => 
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    
    const matchesCategory = !selectedCategory || category.id === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const totalExperts = 127 // This would come from your database
  const totalConsultations = 2840 // This would come from your database
  const averageRating = 4.8 // This would come from your database

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-purple-800/50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Expert Consultations
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Connect with industry experts for personalized guidance on cultivation, 
              engineering, compliance, and business operations
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 justify-center mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-2xl font-bold text-white">{totalExperts}+</span>
                </div>
                <p className="text-gray-400 text-sm">Verified Experts</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 justify-center mb-2">
                  <Video className="w-5 h-5 text-green-400" />
                  <span className="text-2xl font-bold text-white">{totalConsultations.toLocaleString()}+</span>
                </div>
                <p className="text-gray-400 text-sm">Consultations Completed</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 justify-center mb-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-2xl font-bold text-white">{averageRating}</span>
                </div>
                <p className="text-gray-400 text-sm">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by expertise, keywords, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Categories</option>
              {consultationCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gray-800 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">1. Browse Experts</h3>
              <p className="text-sm text-gray-400">Find the right expert for your specific needs and challenges</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">2. Book Session</h3>
              <p className="text-sm text-gray-400">Schedule at your convenience with instant confirmation</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Video className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">3. Video Call</h3>
              <p className="text-sm text-gray-400">Connect via secure video with screen sharing capabilities</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">4. Get Results</h3>
              <p className="text-sm text-gray-400">Receive actionable recommendations and follow-up resources</p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {filteredCategories.map((category) => {
            const avgRate = getAverageRateByCategory(category.id)
            const colors = categoryColors[category.id as keyof typeof categoryColors] || {
              bg: 'bg-gray-100',
              text: 'text-gray-800',
              border: 'border-gray-200'
            }
            
            return (
              <div key={category.id} className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl">{category.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                    <p className="text-gray-400 mb-3">{category.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{category.subcategories.length} specialties</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>From ${avgRate}/hr</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Subcategories Preview */}
                <div className="space-y-2 mb-4">
                  {category.subcategories.slice(0, 3).map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-white text-sm">{sub.name}</h4>
                        <p className="text-xs text-gray-400 mt-1">{sub.description}</p>
                      </div>
                      <div className="text-right text-xs text-gray-400">
                        <div>${sub.averageRate}/hr</div>
                        <div>{sub.typicalDuration} min</div>
                      </div>
                    </div>
                  ))}
                  {category.subcategories.length > 3 && (
                    <div className="text-center text-sm text-gray-400">
                      +{category.subcategories.length - 3} more specialties
                    </div>
                  )}
                </div>
                
                <Link 
                  href={`/experts?category=${category.id}`}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Browse {category.name} Experts
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )
          })}
        </div>

        {/* Trust & Safety */}
        <div className="bg-gray-800 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center gap-2">
            <Shield className="w-6 h-6 text-green-400" />
            Trust & Safety
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Verified Experts</h3>
              <p className="text-sm text-gray-400">All experts undergo background checks and credential verification</p>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Secure Platform</h3>
              <p className="text-sm text-gray-400">End-to-end encrypted video calls and secure payment processing</p>
            </div>
            <div className="text-center">
              <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Quality Guaranteed</h3>
              <p className="text-sm text-gray-400">100% satisfaction guarantee with our expert matching and session quality</p>
            </div>
          </div>
        </div>

        {/* Popular Consultations */}
        <div className="bg-gray-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Popular This Week</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Nutrient Recipe Formulation', category: 'Growing & Agronomy', rate: 225, duration: 120 },
              { name: 'Financial Modeling & Unit Economics', category: 'Business Operations', rate: 300, duration: 120 },
              { name: 'Facility Layout & Workflow', category: 'Engineering & Systems', rate: 300, duration: 120 },
              { name: 'HACCP Plan Development', category: 'Food Safety & Compliance', rate: 300, duration: 180 },
              { name: 'LED Lighting System Design', category: 'Engineering & Systems', rate: 250, duration: 90 },
              { name: 'Distribution Network Design', category: 'Supply Chain', rate: 300, duration: 120 }
            ].map((consultation, index) => (
              <div key={index} className="p-4 bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-white mb-2">{consultation.name}</h3>
                <p className="text-sm text-gray-400 mb-3">{consultation.category}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-400">${consultation.rate}/hr</span>
                  <span className="text-gray-400">{consultation.duration} min</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-8 border border-purple-800/50 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Connect with an Expert?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Get personalized guidance from industry professionals who understand your challenges and can provide actionable solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/experts"
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              Browse All Experts
            </Link>
            <Link 
              href="/experts/apply"
              className="px-8 py-3 bg-transparent border border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white font-semibold rounded-lg transition-colors"
            >
              Become an Expert
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}