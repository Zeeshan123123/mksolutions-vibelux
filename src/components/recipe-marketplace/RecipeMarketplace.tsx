/**
 * Recipe Marketplace Component
 * Browse, purchase, and license proven light recipes
 */

"use client"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Search, Filter, Star, TrendingUp, Award, ShieldCheck, 
  DollarSign, Package, Zap, Leaf, FlaskConical, Users,
  CheckCircle, Info, Lock, Crown
} from 'lucide-react'

import { 
  LicensedRecipe, 
  RECIPE_FEATURES,
  recipeLicensingService 
} from '@/lib/recipe-marketplace/recipe-licensing'

// Mock data for demonstration
const mockRecipes: LicensedRecipe[] = [
  {
    id: '1',
    recipeId: 'recipe_001',
    name: 'High-Yield Tomato Maximizer',
    description: 'Proven recipe increasing tomato yields by 25% with enhanced flavor profile and extended shelf life.',
    crop: 'Tomato',
    creatorId: 'grower_123',
    creatorName: 'GreenThumb Farms',
    creatorRating: 4.8,
    creatorVerified: true,
    features: [
      { id: 'yield-increase', name: 'Increased Yield', category: 'yield', measurable: true, unit: '%', improvement: 25, verified: true },
      { id: 'enhanced-color', name: 'Enhanced Coloration', category: 'quality', measurable: true, verified: true },
      { id: 'sugar-content', name: 'Optimized Sugar/Brix', category: 'nutrition', measurable: true, unit: '°Brix', improvement: 15, verified: true }
    ],
    provenResults: [
      { metric: 'Yield', baseline: 40, achieved: 50, improvement: 25, verificationSource: 'third-party', evidence: ['lab-report-url'] },
      { metric: 'Brix Level', baseline: 4.5, achieved: 5.2, improvement: 15.5, verificationSource: 'platform-verified' }
    ],
    licensing: {
      type: 'subscription',
      pricing: { monthly: 299, yearly: 2999 },
      termsOfUse: ['Commercial use allowed', 'Modifications permitted', 'Resale prohibited'],
      restrictions: ['Not for cannabis cultivation'],
      supportIncluded: true,
      updateIncluded: true
    },
    statistics: {
      totalLicenses: 47,
      activeUsers: 42,
      avgRating: 4.7,
      totalReviews: 38,
      successRate: 89,
      totalRevenue: 125000
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-10'),
    status: 'active',
    tags: ['proven', 'high-yield', 'flavor']
  },
  {
    id: '2',
    recipeId: 'recipe_002',
    name: 'Premium Cannabis Terpene Booster',
    description: 'Scientifically optimized spectrum for 30% increase in terpene production with maintained THC levels.',
    crop: 'Cannabis',
    strain: 'Multiple',
    creatorId: 'grower_456',
    creatorName: 'Craft Cannabis Co',
    creatorRating: 4.9,
    creatorVerified: true,
    features: [
      { id: 'terpene-profile', name: 'Enhanced Terpenes', category: 'nutrition', measurable: true, unit: '%', improvement: 30, verified: true },
      { id: 'thc-content', name: 'Maintained THC', category: 'nutrition', measurable: true, unit: '%', verified: true },
      { id: 'energy-saving', name: 'Energy Efficient', category: 'efficiency', measurable: true, unit: 'kWh/kg', improvement: 15, verified: false }
    ],
    provenResults: [
      { metric: 'Total Terpenes', baseline: 2.5, achieved: 3.25, improvement: 30, verificationSource: 'third-party', evidence: ['lab1', 'lab2'] },
      { metric: 'Energy Use', baseline: 650, achieved: 550, improvement: 15.4, verificationSource: 'platform-verified' }
    ],
    licensing: {
      type: 'royalty',
      pricing: { royaltyPercent: 3, royaltyMinimum: 500 },
      termsOfUse: ['Per-cycle royalty based on yield value', 'Minimum $500/cycle'],
      restrictions: ['Legal markets only', 'Lab testing required'],
      supportIncluded: true,
      updateIncluded: true
    },
    statistics: {
      totalLicenses: 23,
      activeUsers: 21,
      avgRating: 4.9,
      totalReviews: 19,
      successRate: 95,
      totalRevenue: 87500
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-15'),
    status: 'active',
    tags: ['cannabis', 'terpenes', 'premium']
  },
  {
    id: '3',
    recipeId: 'recipe_003',
    name: 'Lettuce Speed Grower',
    description: 'Reduce lettuce growing cycle by 5 days while maintaining quality. Perfect for high-turnover operations.',
    crop: 'Lettuce',
    creatorId: 'grower_789',
    creatorName: 'QuickGreens LLC',
    creatorRating: 4.5,
    creatorVerified: false,
    features: [
      { id: 'faster-growth', name: 'Faster Growth Cycle', category: 'yield', measurable: true, unit: 'days', improvement: -5, verified: true },
      { id: 'uniformity', name: 'Improved Crop Uniformity', category: 'quality', measurable: true, unit: '%', improvement: 20, verified: false }
    ],
    provenResults: [
      { metric: 'Days to Harvest', baseline: 35, achieved: 30, improvement: 14.3, verificationSource: 'self-reported' }
    ],
    licensing: {
      type: 'one-time',
      pricing: { oneTime: 999 },
      termsOfUse: ['Lifetime license', 'Unlimited use'],
      restrictions: [],
      supportIncluded: false,
      updateIncluded: false
    },
    statistics: {
      totalLicenses: 156,
      activeUsers: 142,
      avgRating: 4.3,
      totalReviews: 98,
      successRate: 82,
      totalRevenue: 155844
    },
    createdAt: new Date('2023-11-20'),
    updatedAt: new Date('2024-03-01'),
    status: 'active',
    tags: ['lettuce', 'fast', 'efficiency']
  }
];

export default function RecipeMarketplace() {
  const [recipes, setRecipes] = useState<LicensedRecipe[]>(mockRecipes)
  const [filteredRecipes, setFilteredRecipes] = useState<LicensedRecipe[]>(mockRecipes)
  const [selectedRecipe, setSelectedRecipe] = useState<LicensedRecipe | null>(null)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('browse')
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCrop, setSelectedCrop] = useState('all')
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<'all' | 'free' | 'under-100' | 'under-500' | 'premium'>('all')
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  // Apply filters
  useEffect(() => {
    let filtered = recipes

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.creatorName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Crop filter
    if (selectedCrop !== 'all') {
      filtered = filtered.filter(r => r.crop === selectedCrop)
    }

    // Feature filter
    if (selectedFeatures.length > 0) {
      filtered = filtered.filter(r => 
        selectedFeatures.some(f => r.features.some(rf => rf.id === f))
      )
    }

    // Verified filter
    if (verifiedOnly) {
      filtered = filtered.filter(r => r.creatorVerified)
    }

    // Price filter
    filtered = filtered.filter(r => {
      const price = r.licensing.pricing.oneTime || 
                   r.licensing.pricing.monthly || 
                   r.licensing.pricing.royaltyMinimum || 0
      
      switch (priceRange) {
        case 'free': return price === 0
        case 'under-100': return price < 100
        case 'under-500': return price < 500
        case 'premium': return price >= 500
        default: return true
      }
    })

    setFilteredRecipes(filtered)
  }, [searchTerm, selectedCrop, selectedFeatures, priceRange, verifiedOnly, recipes])

  // Get unique crops
  const crops = ['all', ...new Set(recipes.map(r => r.crop))]

  // Format price display
  const formatPrice = (recipe: LicensedRecipe) => {
    const { pricing } = recipe.licensing
    if (pricing.oneTime) return `$${pricing.oneTime} one-time`
    if (pricing.monthly) return `$${pricing.monthly}/mo`
    if (pricing.royaltyPercent) return `${pricing.royaltyPercent}% royalty`
    return 'Free'
  }

  // Get feature categories
  const featureCategories = ['yield', 'quality', 'nutrition', 'efficiency', 'sustainability']

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Recipe Marketplace</h2>
          <p className="text-muted-foreground">
            License proven light recipes from successful growers
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          List Your Recipe
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Recipes</TabsTrigger>
          <TabsTrigger value="my-licenses">My Licenses</TabsTrigger>
          <TabsTrigger value="my-listings">My Listings</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search recipes, features, or creators..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Crops" />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map(crop => (
                      <SelectItem key={crop} value={crop}>
                        {crop === 'all' ? 'All Crops' : crop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={priceRange} onValueChange={(v: any) => setPriceRange(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Any Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Price</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="under-100">Under $100</SelectItem>
                    <SelectItem value="under-500">Under $500</SelectItem>
                    <SelectItem value="premium">Premium ($500+)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="verified" 
                    checked={verifiedOnly}
                    onCheckedChange={(c) => setVerifiedOnly(c as boolean)}
                  />
                  <label htmlFor="verified" className="text-sm cursor-pointer">
                    Verified Only
                  </label>
                </div>
              </div>

              {/* Feature Filters */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Filter by Features:</p>
                <div className="flex flex-wrap gap-2">
                  {RECIPE_FEATURES.slice(0, 10).map(feature => (
                    <Badge
                      key={feature.id}
                      variant={selectedFeatures.includes(feature.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedFeatures(prev =>
                          prev.includes(feature.id)
                            ? prev.filter(f => f !== feature.id)
                            : [...prev, feature.id]
                        )
                      }}
                    >
                      {feature.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map(recipe => (
              <Card 
                key={recipe.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedRecipe(recipe)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{recipe.name}</CardTitle>
                    {recipe.creatorVerified && (
                      <ShieldCheck className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{recipe.crop}</span>
                    {recipe.strain && <span>• {recipe.strain}</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {recipe.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {recipe.features.slice(0, 3).map(feature => (
                      <Badge key={feature.id} variant="secondary" className="text-xs">
                        {feature.name}
                        {feature.improvement && (
                          <span className="ml-1 text-green-600">
                            +{feature.improvement}{feature.unit || '%'}
                          </span>
                        )}
                      </Badge>
                    ))}
                    {recipe.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{recipe.features.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>{recipe.statistics.avgRating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({recipe.statistics.totalReviews})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{recipe.statistics.activeUsers}</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  {/* Creator & Price */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <p className="text-muted-foreground">by {recipe.creatorName}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(recipe.creatorRating)
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(recipe)}</p>
                      <p className="text-xs text-muted-foreground">
                        {recipe.statistics.successRate}% success
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-licenses" className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your licensed recipes will appear here. You can track usage, performance, and access support.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="my-listings" className="space-y-6">
          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription>
              Track your recipe sales, reviews, and earnings here. Manage pricing and respond to user feedback.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* Recipe Detail Dialog */}
      <Dialog open={!!selectedRecipe} onOpenChange={(open) => !open && setSelectedRecipe(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <DialogTitle className="text-2xl">{selectedRecipe.name}</DialogTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge>{selectedRecipe.crop}</Badge>
                      {selectedRecipe.strain && <Badge variant="outline">{selectedRecipe.strain}</Badge>}
                      {selectedRecipe.creatorVerified && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Verified Creator
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => setShowPurchaseDialog(true)}>
                    <Lock className="w-4 h-4 mr-2" />
                    Get License
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{selectedRecipe.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Proven Features & Benefits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedRecipe.features.map(feature => (
                      <div key={feature.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {feature.verified ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Info className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="font-medium">{feature.name}</span>
                        </div>
                        {feature.improvement && (
                          <Badge className="bg-green-100 text-green-800">
                            +{feature.improvement}{feature.unit || '%'}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Verified Results</h3>
                  <div className="space-y-2">
                    {selectedRecipe.provenResults.map((result, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{result.metric}</span>
                          <Badge variant={result.verificationSource === 'third-party' ? 'default' : 'secondary'}>
                            {result.verificationSource}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Baseline: {result.baseline}</span>
                          <span>→</span>
                          <span className="font-medium text-green-600">Achieved: {result.achieved}</span>
                          <span className="ml-auto">
                            <TrendingUp className="w-4 h-4 inline mr-1" />
                            +{result.improvement}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Creator Information</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{selectedRecipe.creatorName}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(selectedRecipe.creatorRating)
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm ml-1">({selectedRecipe.statistics.totalReviews} reviews)</span>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p>{selectedRecipe.statistics.totalLicenses} licenses sold</p>
                        <p className="text-muted-foreground">{selectedRecipe.statistics.successRate}% success rate</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Licensing Terms</h3>
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Price:</span>
                      <span className="text-lg font-semibold">{formatPrice(selectedRecipe)}</span>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      {selectedRecipe.licensing.termsOfUse.map((term, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>{term}</span>
                        </div>
                      ))}
                    </div>
                    {selectedRecipe.licensing.supportIncluded && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Zap className="w-3 h-3 mr-1" />
                        Support Included
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Purchase Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Recipe License</DialogTitle>
            <DialogDescription>
              Complete your purchase to get instant access to this proven recipe
            </DialogDescription>
          </DialogHeader>
          {/* Purchase form would go here */}
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This recipe has helped {selectedRecipe?.statistics.activeUsers} growers achieve 
                an average {selectedRecipe?.provenResults[0]?.improvement}% improvement
              </AlertDescription>
            </Alert>
            <Button className="w-full">
              <DollarSign className="w-4 h-4 mr-2" />
              Complete Purchase
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}