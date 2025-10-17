'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { logger } from '@/lib/client-logger';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { recipeMarketplaceService } from '@/lib/services/recipe-marketplace-service'
import type { CultivationRecipeData } from '@/types/recipe-marketplace'
import { 
  Search, 
  TrendingUp, 
  Award, 
  DollarSign, 
  Users, 
  Sparkles,
  Plus,
  Filter,
  ShoppingCart,
  Star,
  Leaf,
  FlaskConical,
  BarChart,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Zap,
  Calendar,
  Target
} from 'lucide-react'

export function RecipeMarketplace() {
  const { userId } = useAuth()
  const router = useRouter()
  const [featuredRecipes, setFeaturedRecipes] = useState<CultivationRecipeData[]>([])
  const [popularRecipes, setPopularRecipes] = useState<CultivationRecipeData[]>([])
  const [searchResults, setSearchResults] = useState<CultivationRecipeData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('browse')
  
  // Filter states
  const [strainFilter, setStrainFilter] = useState<string>('')
  const [thcRange, setThcRange] = useState<number[]>([0, 35])
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000])
  const [sortBy, setSortBy] = useState<string>('rating')

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [featured, popular] = await Promise.all([
        recipeMarketplaceService.getFeaturedRecipes(),
        recipeMarketplaceService.getPopularRecipes()
      ])
      setFeaturedRecipes(featured)
      setPopularRecipes(popular)
    } catch (error) {
      logger.error('system', 'Failed to load marketplace data:', error )
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setLoading(true)
      const results = await recipeMarketplaceService.searchRecipes({
        query: searchQuery,
        strain: strainFilter || undefined,
        thcRange: thcRange as [number, number],
        priceRange: priceRange as [number, number],
        sortBy: sortBy as any
      })
      setSearchResults(results.recipes)
      setActiveTab('search')
    } catch (error) {
      logger.error('system', 'Search failed:', error )
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const RecipeCard = ({ recipe }: { recipe: CultivationRecipeData }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/marketplace/recipes/${recipe.id}`)}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{recipe.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Leaf className="h-3 w-3" />
              {recipe.strainName}
            </CardDescription>
          </div>
          {recipe.verified && (
            <Badge className="bg-purple-600 shrink-0">
              <Award className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <FlaskConical className="h-3 w-3" />
                THC
              </div>
              <p className="font-semibold">{recipe.results?.quality?.thcPercentage || 'N/A'}%</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Target className="h-3 w-3" />
                Yield
              </div>
              <p className="font-semibold">{recipe.results?.yield?.gramsPerSqft || 'N/A'} g/ft²</p>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{recipe.duration?.totalWeeks || 'N/A'} weeks</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Zap className="h-3 w-3" />
              <span>{recipe.energyProfile?.totalKwh || 'N/A'} kWh</span>
            </div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm ml-1 font-medium">{recipe.rating?.average?.toFixed(1) || 'New'}</span>
            </div>
            <span className="text-sm text-muted-foreground">({recipe.rating?.count || 0} reviews)</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4" />
          <span className="font-bold">{formatPrice(recipe.pricing?.basePrice || 0)}</span>
        </div>
        <Button size="sm" variant="outline">View Details</Button>
      </CardFooter>
    </Card>
  )

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-8 mb-8 text-white">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold mb-4">Cultivation Recipe Marketplace</h2>
          <p className="text-lg mb-6 opacity-90">
            Discover and license proven cultivation protocols from expert growers. Complete recipes include lighting schedules, nutrient regimens, environmental controls, and training techniques.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" variant="secondary" onClick={() => setActiveTab('browse')}>
              <Search className="mr-2 h-5 w-5" />
              Browse Recipes
            </Button>
            {userId ? (
              <Button 
                size="lg" 
                variant="default" 
                className="bg-white text-purple-600 hover:bg-gray-100" 
                onClick={() => router.push('/marketplace/recipes/create')}
              >
                <Plus className="mr-2 h-5 w-5" />
                Sell Your Recipe
              </Button>
            ) : (
              <Button 
                size="lg" 
                variant="default" 
                className="bg-white text-purple-600 hover:bg-gray-100" 
                onClick={() => router.push('/sign-in')}
              >
                <Plus className="mr-2 h-5 w-5" />
                Sign In to Sell
              </Button>
            )}
            <Button 
              size="lg" 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={() => router.push('/marketplace/how-it-works')}
            >
              <BookOpen className="mr-2 h-5 w-5" />
              How It Works
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Leaf className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">Coming Soon</p>
              <p className="text-sm text-muted-foreground">Recipe Library</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">Beta</p>
              <p className="text-sm text-muted-foreground">Creator Program</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">Join</p>
              <p className="text-sm text-muted-foreground">Early Access</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <BarChart className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold">Launch</p>
              <p className="text-sm text-muted-foreground">Q2 2025</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Find Your Perfect Recipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by strain, creator, or characteristics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Strain Type</label>
                <Select value={strainFilter} onValueChange={setStrainFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All strains" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All strains</SelectItem>
                    <SelectItem value="indica">Indica</SelectItem>
                    <SelectItem value="sativa">Sativa</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">THC Range: {thcRange[0]}-{thcRange[1]}%</label>
                <Slider
                  value={thcRange}
                  onValueChange={setThcRange}
                  max={35}
                  step={1}
                  className="mt-3"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Price Range: ${priceRange[0]}-${priceRange[1]}</label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={5000}
                  step={100}
                  className="mt-3"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price">Price: Low to High</SelectItem>
                    <SelectItem value="yield">Highest Yield</SelectItem>
                    <SelectItem value="created">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="search">Search Results</TabsTrigger>
          {userId && <TabsTrigger value="my-recipes">My Recipes</TabsTrigger>}
          {userId && <TabsTrigger value="purchased">Purchased</TabsTrigger>}
        </TabsList>

        <TabsContent value="browse" className="space-y-8">
          {/* Featured Recipes */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="text-2xl font-bold">Featured Recipes</h3>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="h-64 animate-pulse bg-muted" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredRecipes.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </div>

          {/* Popular Recipes */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="text-2xl font-bold">Popular This Month</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {popularRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Share Your Success</h3>
                <p className="text-muted-foreground">Turn your proven cultivation methods into passive income</p>
              </div>
              <Button onClick={() => router.push('/marketplace/recipes/create')}>
                Start Selling
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search">
          {searchResults.length === 0 ? (
            <Card className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recipes found. Try adjusting your filters.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {searchResults.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </TabsContent>

        {userId && (
          <TabsContent value="my-recipes">
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">You haven't created any recipes yet.</p>
              <Button onClick={() => router.push('/marketplace/recipes/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Recipe
              </Button>
            </div>
          </TabsContent>
        )}

        {userId && (
          <TabsContent value="purchased">
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">You haven't purchased any recipes yet.</p>
              <Button variant="outline" onClick={() => setActiveTab('browse')}>
                Browse Recipes
              </Button>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}