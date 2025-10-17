'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { logger } from '@/lib/client-logger';
import { 
  Search, Filter, ShoppingCart, Star, Heart,
  Eye, ExternalLink, Camera, Package, Zap,
  TrendingUp, Shield, Award, ChevronRight,
  Grid, List, SortAsc, X
} from 'lucide-react';
import { findSimilarEquipment } from '@/lib/cloudinary-visual-search';
import { generateAffiliateLink, FEATURED_PRODUCTS, EQUIPMENT_CATEGORIES } from '@/lib/amazon-affiliate';
import { EquipmentRecommendations } from '@/components/equipment/EquipmentRecommendations';

interface MarketplaceItem {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  condition: 'new' | 'used' | 'refurbished';
  seller: {
    name: string;
    rating: number;
    verified: boolean;
  };
  amazonAsin?: string;
  views: number;
  favorites: number;
  dateAdded: Date;
}

export function EquipmentMarketplace() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MarketplaceItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'popular'>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [visualSearchImage, setVisualSearchImage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Mock data - in production, fetch from API
  useEffect(() => {
    const mockItems: MarketplaceItem[] = [
      {
        id: '1',
        title: 'Spider Farmer SF-2000 LED Grow Light - Like New',
        price: 249.99,
        image: 'https://res.cloudinary.com/demo/image/upload/v1/equipment/sf2000.jpg',
        category: 'lighting',
        condition: 'used',
        seller: { name: 'GrowPro Shop', rating: 4.8, verified: true },
        amazonAsin: 'B07VL8FZS1',
        views: 342,
        favorites: 28,
        dateAdded: new Date('2024-01-15')
      },
      {
        id: '2',
        title: 'AC Infinity Controller 69 Pro - New in Box',
        price: 139.99,
        image: 'https://res.cloudinary.com/demo/image/upload/v1/equipment/controller69.jpg',
        category: 'environmental',
        condition: 'new',
        seller: { name: 'Indoor Gardens LLC', rating: 4.9, verified: true },
        amazonAsin: 'B08LKJPR5D',
        views: 215,
        favorites: 19,
        dateAdded: new Date('2024-01-20')
      }
    ];
    
    setItems(mockItems);
    setFilteredItems(mockItems);
  }, []);

  // Filter and sort items
  useEffect(() => {
    let filtered = [...items];

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price filter
    filtered = filtered.filter(item =>
      item.price >= priceRange.min && item.price <= priceRange.max
    );

    // Sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
    }

    setFilteredItems(filtered);
  }, [items, selectedCategory, searchQuery, priceRange, sortBy]);

  // Visual search handler
  const handleVisualSearch = async (imageFile: File) => {
    setIsSearching(true);
    try {
      const imageUrl = URL.createObjectURL(imageFile);
      setVisualSearchImage(imageUrl);
      
      const similarItems = await findSimilarEquipment(imageUrl, {
        maxResults: 20,
        includeAmazonProducts: true
      });
      
      // Convert visual search results to marketplace items
      const searchResults: MarketplaceItem[] = similarItems.map((result, index) => ({
        id: `search_${index}`,
        title: result.metadata.title || 'Similar Equipment',
        price: result.metadata.price || 0,
        image: result.transformedUrl,
        category: result.metadata.category || 'general',
        condition: 'new' as const,
        seller: { 
          name: 'Amazon', 
          rating: 4.5, 
          verified: true 
        },
        amazonAsin: result.affiliateLink?.match(/dp\/([A-Z0-9]+)/)?.[1],
        views: Math.floor(Math.random() * 1000),
        favorites: Math.floor(Math.random() * 100),
        dateAdded: new Date()
      }));
      
      setFilteredItems(searchResults);
    } catch (error) {
      logger.error('system', 'Visual search failed:', error );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-purple-900/20 to-gray-950 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Equipment Marketplace</h1>
              <p className="text-gray-400">Find great deals on grow equipment from our community and Amazon</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all">
                List Equipment
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search equipment..."
                className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
            
            {/* Visual Search */}
            <label className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleVisualSearch(e.target.files[0])}
                className="hidden"
              />
              <button className="px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white hover:border-gray-700 transition-all flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Visual Search
              </button>
            </label>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white hover:border-gray-700 transition-all flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className={`w-64 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            {/* Categories */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-white font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {Object.entries(EQUIPMENT_CATEGORIES).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                      selectedCategory === key
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-sm">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-white font-semibold mb-4">Price Range</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Min Price</label>
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Max Price</label>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>

            {/* Condition Filter */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="text-white font-semibold mb-4">Condition</h3>
              <div className="space-y-2">
                {['new', 'used', 'refurbished'].map((condition) => (
                  <label key={condition} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300 capitalize">{condition}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400">
                {filteredItems.length} items found
              </p>
              
              <div className="flex items-center gap-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
                
                {/* View Mode */}
                <div className="flex items-center gap-1 bg-gray-900 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Search Active */}
            {visualSearchImage && (
              <div className="mb-6 p-4 bg-purple-900/20 border border-purple-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={visualSearchImage} alt="Search" className="w-12 h-12 rounded object-cover" />
                  <span className="text-purple-400">Showing visually similar items</span>
                </div>
                <button
                  onClick={() => {
                    setVisualSearchImage(null);
                    setFilteredItems(items);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Loading State */}
            {isSearching && (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-3 text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  Searching for similar equipment...
                </div>
              </div>
            )}

            {/* Items Grid/List */}
            {!isSearching && (
              <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 transition-all ${
                      viewMode === 'list' ? 'flex gap-6 p-6' : 'overflow-hidden'
                    }`}
                  >
                    {/* Image */}
                    <div className={viewMode === 'list' ? 'w-48 h-32' : 'relative h-48'}>
                      <img
                        src={item.image}
                        alt={item.title}
                        className={`${viewMode === 'list' ? 'rounded-lg' : ''} w-full h-full object-cover`}
                      />
                      {viewMode === 'grid' && (
                        <div className="absolute top-2 right-2 flex gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.condition === 'new' ? 'bg-green-900 text-green-400' :
                            item.condition === 'used' ? 'bg-yellow-900 text-yellow-400' :
                            'bg-blue-900 text-blue-400'
                          }`}>
                            {item.condition}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className={viewMode === 'grid' ? 'p-4' : 'flex-1'}>
                      <h3 className="text-white font-semibold mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-white">
                          ${item.price}
                        </span>
                        {item.amazonAsin && (
                          <span className="text-xs bg-orange-900/50 text-orange-400 px-2 py-1 rounded">
                            Also on Amazon
                          </span>
                        )}
                      </div>

                      {/* Seller Info */}
                      <div className="flex items-center gap-2 mb-3 text-sm">
                        <span className="text-gray-400">by {item.seller.name}</span>
                        {item.seller.verified && (
                          <Shield className="w-4 h-4 text-green-400" />
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-gray-400">{item.seller.rating}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {item.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {item.favorites}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all">
                          View Details
                        </button>
                        {item.amazonAsin && (
                          <a
                            href={generateAffiliateLink(item.amazonAsin)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all flex items-center gap-1"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Amazon Recommendations */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6">
                Recommended on Amazon
              </h2>
              <EquipmentRecommendations
                category={selectedCategory as any || 'lighting'}
                userProfile={{
                  facilitySize: 25,
                  experience: 'intermediate'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}