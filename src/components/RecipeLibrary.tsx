"use client"

import { useState } from 'react'
import { 
  Layers,
  Save,
  Copy,
  Download,
  Upload,
  Share2,
  Star,
  Clock,
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Info,
  TrendingUp
} from 'lucide-react'

interface ClimateRecipe {
  id: string
  name: string
  description: string
  strain: string
  createdBy: string
  createdAt: string
  lastModified: string
  version: number
  public: boolean
  rating: number
  usageCount: number
  tags: string[]
  phases: RecipePhase[]
  expectedResults: {
    yield: string
    quality: string
    cycleTime: number
    energyUsage: string
  }
}

interface RecipePhase {
  name: string
  duration: number
  temperature: { day: number; night: number }
  humidity: { day: number; night: number }
  co2: { day: number; night: number }
  vpd: { target: number; min: number; max: number }
  lightIntensity: number
  photoperiod: { on: string; off: string }
  notes?: string
}

export function RecipeLibrary() {
  const [viewMode, setViewMode] = useState<'library' | 'create' | 'edit'>('library')
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null)
  const [filterTag, setFilterTag] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Sample recipes
  const [recipes] = useState<ClimateRecipe[]>([
    {
      id: 'recipe-1',
      name: 'Blue Dream High Yield Protocol',
      description: 'Optimized for maximum yield with Blue Dream genetics. Focuses on extended veg period and progressive light intensity.',
      strain: 'Blue Dream',
      createdBy: 'Master Grower Team',
      createdAt: '2023-10-15',
      lastModified: '2024-01-05',
      version: 3,
      public: true,
      rating: 4.8,
      usageCount: 247,
      tags: ['high-yield', 'sativa', 'commercial', 'verified'],
      phases: [
        {
          name: 'Clone/Seedling',
          duration: 7,
          temperature: { day: 25, night: 23 },
          humidity: { day: 70, night: 75 },
          co2: { day: 800, night: 400 },
          vpd: { target: 0.8, min: 0.6, max: 1.0 },
          lightIntensity: 200,
          photoperiod: { on: '06:00', off: '00:00' },
          notes: 'Gentle introduction with high humidity for root development'
        },
        {
          name: 'Vegetative',
          duration: 28,
          temperature: { day: 26, night: 22 },
          humidity: { day: 65, night: 70 },
          co2: { day: 1200, night: 400 },
          vpd: { target: 1.0, min: 0.8, max: 1.2 },
          lightIntensity: 450,
          photoperiod: { on: '06:00', off: '00:00' },
          notes: 'Extended veg for maximum canopy development'
        },
        {
          name: 'Flowering',
          duration: 63,
          temperature: { day: 24, night: 20 },
          humidity: { day: 55, night: 60 },
          co2: { day: 1000, night: 400 },
          vpd: { target: 1.2, min: 1.0, max: 1.4 },
          lightIntensity: 700,
          photoperiod: { on: '06:00', off: '18:00' },
          notes: 'Progressive intensity increase weeks 1-3, maintain through week 8'
        }
      ],
      expectedResults: {
        yield: '650-700 g/m²',
        quality: 'AAA Grade',
        cycleTime: 98,
        energyUsage: '42 kWh/kg'
      }
    },
    {
      id: 'recipe-2',
      name: 'OG Kush Premium Quality',
      description: 'Focused on terpene and cannabinoid production. Lower yields but exceptional quality.',
      strain: 'OG Kush',
      createdBy: 'Craft Cannabis Co',
      createdAt: '2023-11-20',
      lastModified: '2023-12-18',
      version: 2,
      public: true,
      rating: 4.9,
      usageCount: 189,
      tags: ['quality-focus', 'indica', 'craft', 'verified'],
      phases: [
        {
          name: 'Clone/Seedling',
          duration: 7,
          temperature: { day: 24, night: 22 },
          humidity: { day: 65, night: 70 },
          co2: { day: 700, night: 400 },
          vpd: { target: 0.9, min: 0.7, max: 1.1 },
          lightIntensity: 180,
          photoperiod: { on: '06:00', off: '00:00' }
        },
        {
          name: 'Vegetative',
          duration: 21,
          temperature: { day: 25, night: 21 },
          humidity: { day: 60, night: 65 },
          co2: { day: 1000, night: 400 },
          vpd: { target: 1.1, min: 0.9, max: 1.3 },
          lightIntensity: 400,
          photoperiod: { on: '06:00', off: '00:00' }
        },
        {
          name: 'Flowering',
          duration: 56,
          temperature: { day: 23, night: 18 },
          humidity: { day: 50, night: 55 },
          co2: { day: 900, night: 400 },
          vpd: { target: 1.3, min: 1.1, max: 1.5 },
          lightIntensity: 650,
          photoperiod: { on: '06:00', off: '18:00' },
          notes: 'Lower night temps weeks 7-8 for color expression'
        }
      ],
      expectedResults: {
        yield: '500-550 g/m²',
        quality: 'AAAA Craft',
        cycleTime: 84,
        energyUsage: '48 kWh/kg'
      }
    },
    {
      id: 'recipe-3',
      name: 'Fast Flower Energy Saver',
      description: 'Rapid cycle focused on energy efficiency. Good for high turnover operations.',
      strain: 'Various Autoflower',
      createdBy: 'EcoGrow Systems',
      createdAt: '2024-01-02',
      lastModified: '2024-01-10',
      version: 1,
      public: false,
      rating: 4.2,
      usageCount: 67,
      tags: ['energy-efficient', 'autoflower', 'fast-cycle'],
      phases: [
        {
          name: 'Full Cycle',
          duration: 70,
          temperature: { day: 24, night: 21 },
          humidity: { day: 60, night: 65 },
          co2: { day: 900, night: 400 },
          vpd: { target: 1.0, min: 0.8, max: 1.2 },
          lightIntensity: 500,
          photoperiod: { on: '06:00', off: '00:00' },
          notes: 'Consistent parameters throughout with 20/4 light cycle'
        }
      ],
      expectedResults: {
        yield: '400-450 g/m²',
        quality: 'AA Grade',
        cycleTime: 70,
        energyUsage: '35 kWh/kg'
      }
    }
  ])

  const currentRecipe = recipes.find(r => r.id === selectedRecipe)

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.strain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag = filterTag === 'all' || recipe.tags.includes(filterTag)
    return matchesSearch && matchesTag
  })

  // All available tags
  const allTags = Array.from(new Set(recipes.flatMap(r => r.tags)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Climate Recipe Library</h2>
            <p className="text-sm text-gray-400 mt-1">
              Save, share, and clone proven growth recipes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('create')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Recipe
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="all">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
          <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            <Filter className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {viewMode === 'library' && (
        <>
          {/* Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-white">{recipe.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{recipe.strain}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-white">{recipe.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-300 mb-4 line-clamp-2">{recipe.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {recipe.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-400">Cycle Time</span>
                    <p className="text-white font-medium">{recipe.expectedResults.cycleTime} days</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Expected Yield</span>
                    <p className="text-white font-medium">{recipe.expectedResults.yield}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Energy Usage</span>
                    <p className="text-white font-medium">{recipe.expectedResults.energyUsage}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Used By</span>
                    <p className="text-white font-medium">{recipe.usageCount} growers</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Users className="w-3 h-3" />
                    <span>{recipe.createdBy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedRecipe(recipe.id)}
                      className="p-1.5 hover:bg-gray-800 rounded transition-colors"
                    >
                      <Info className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-800 rounded transition-colors">
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-800 rounded transition-colors">
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Recipe Details */}
          {selectedRecipe && currentRecipe && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">{currentRecipe.name} - Full Details</h3>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Recipe Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-800 rounded-lg">
                  <div>
                    <span className="text-xs text-gray-400">Version</span>
                    <p className="text-white font-medium">v{currentRecipe.version}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Created</span>
                    <p className="text-white font-medium">{currentRecipe.createdAt}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Last Modified</span>
                    <p className="text-white font-medium">{currentRecipe.lastModified}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Visibility</span>
                    <p className="text-white font-medium">{currentRecipe.public ? 'Public' : 'Private'}</p>
                  </div>
                </div>

                {/* Phase Details */}
                <div>
                  <h4 className="font-medium text-white mb-3">Growth Phases</h4>
                  <div className="space-y-3">
                    {currentRecipe.phases.map((phase, index) => (
                      <div key={index} className="p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-white">{phase.name}</h5>
                          <span className="text-sm text-gray-400">{phase.duration} days</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-400">Temp Day/Night</span>
                            <p className="text-white">{phase.temperature.day}°C / {phase.temperature.night}°C</p>
                          </div>
                          <div>
                            <span className="text-gray-400">RH Day/Night</span>
                            <p className="text-white">{phase.humidity.day}% / {phase.humidity.night}%</p>
                          </div>
                          <div>
                            <span className="text-gray-400">CO₂ Day/Night</span>
                            <p className="text-white">{phase.co2.day} / {phase.co2.night} ppm</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Light Intensity</span>
                            <p className="text-white">{phase.lightIntensity} μmol/m²/s</p>
                          </div>
                        </div>
                        {phase.notes && (
                          <p className="text-sm text-gray-400 mt-3">{phase.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Apply Recipe
                  </button>
                  <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    Clone Recipe
                  </button>
                  <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Community Stats */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Community Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400">2,847</p>
            <p className="text-sm text-gray-400">Recipes Shared</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">18.5%</p>
            <p className="text-sm text-gray-400">Avg Yield Increase</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400">$1.2M</p>
            <p className="text-sm text-gray-400">Energy Saved</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-400">4.7/5</p>
            <p className="text-sm text-gray-400">Avg Recipe Rating</p>
          </div>
        </div>
      </div>
    </div>
  )
}