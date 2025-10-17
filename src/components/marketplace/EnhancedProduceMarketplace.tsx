'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  DollarSign,
  MessageSquare,
  ShoppingCart,
  BarChart3,
  Clock,
  Thermometer,
  Droplets,
  Sun,
  Truck,
  Award,
  Shield,
  Target,
  AlertTriangle,
  CheckCircle,
  Users,
  Package,
  Globe,
  Star,
  Eye,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

interface ProduceListing {
  id: string;
  grower: {
    id: string;
    name: string;
    type: 'controlled_environment' | 'open_field' | 'hybrid';
    location: {
      city: string;
      state: string;
      coordinates: [number, number];
    };
    certifications: string[];
    rating: number;
    reviewCount: number;
    established: number;
  };
  product: {
    name: string;
    category: string;
    variety: string;
    grade: string;
    size: string;
    packaging: string;
    certifications: string[];
  };
  availability: {
    current: {
      quantity: number;
      unit: string;
      pricePerUnit: number;
      harvestDate: Date;
      bestBy: Date;
    };
    predicted: Array<{
      date: Date;
      quantity: number;
      confidence: number;
      estimatedPrice: number;
      priceRange: [number, number];
      quality: 'premium' | 'standard' | 'processing';
    }>;
  };
  logistics: {
    fob: boolean;
    canDeliver: boolean;
    maxDeliveryDistance: number;
    shippingMethods: string[];
    leadTime: number;
    minimumOrder: number;
  };
  quality: {
    brix: number;
    firmness: number;
    color: string;
    pesticides: boolean;
    organicStatus: 'certified' | 'transitional' | 'conventional';
    testResults: Array<{
      type: string;
      result: string;
      date: Date;
      lab: string;
    }>;
  };
  volumePricing: Array<{
    minQuantity: number;
    maxQuantity: number;
    pricePerUnit: number;
    discount: number;
  }>;
  negotiable: boolean;
  lastUpdated: Date;
}

interface NegotiationOffer {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  proposedPrice: number;
  deliveryDate: Date;
  terms: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  messages: Array<{
    from: string;
    message: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  expiresAt: Date;
}

const PRODUCE_CATEGORIES = [
  {
    name: 'Leafy Greens',
    subcategories: ['Lettuce', 'Spinach', 'Arugula', 'Kale', 'Swiss Chard', 'Collards', 'Bok Choy']
  },
  {
    name: 'Herbs',
    subcategories: ['Basil', 'Cilantro', 'Parsley', 'Dill', 'Chives', 'Oregano', 'Thyme', 'Rosemary']
  },
  {
    name: 'Vine Crops',
    subcategories: ['Tomatoes', 'Cucumbers', 'Peppers', 'Eggplant', 'Squash', 'Melons']
  },
  {
    name: 'Root Vegetables',
    subcategories: ['Carrots', 'Radishes', 'Beets', 'Turnips', 'Potatoes', 'Sweet Potatoes']
  },
  {
    name: 'Brassicas',
    subcategories: ['Broccoli', 'Cauliflower', 'Cabbage', 'Brussels Sprouts', 'Kohlrabi']
  },
  {
    name: 'Berries',
    subcategories: ['Strawberries', 'Blueberries', 'Raspberries', 'Blackberries']
  },
  {
    name: 'Cannabis',
    subcategories: ['Flower', 'Pre-rolls', 'Concentrates', 'Edibles', 'Biomass', 'Clone', 'Seeds']
  },
  {
    name: 'Microgreens',
    subcategories: ['Pea Shoots', 'Sunflower', 'Radish', 'Mustard', 'Mixed Varieties']
  },
  {
    name: 'Tree Fruits',
    subcategories: ['Apples', 'Citrus', 'Stone Fruits', 'Avocados', 'Berries']
  },
  {
    name: 'Field Crops',
    subcategories: ['Corn', 'Soybeans', 'Wheat', 'Rice', 'Cotton', 'Hay']
  }
];

export default function EnhancedProduceMarketplace() {
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<ProduceListing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'distance' | 'availability' | 'rating'>('price');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');
  const [showNegotiations, setShowNegotiations] = useState(false);
  const [activeNegotiations, setActiveNegotiations] = useState<NegotiationOffer[]>([]);

  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [maxDistance, setMaxDistance] = useState(500);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [inSeasonOnly, setInSeasonOnly] = useState(false);
  const [minQuantity, setMinQuantity] = useState(0);

  useEffect(() => {
    // Load sample data
    loadSampleListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [searchTerm, selectedCategory, selectedSubcategory, sortBy, listings, priceRange, maxDistance, organicOnly, inSeasonOnly, minQuantity]);

  const loadSampleListings = () => {
    const sampleListings: ProduceListing[] = [
      {
        id: '1',
        grower: {
          id: 'grower_1',
          name: 'Sunset Valley Farms',
          type: 'controlled_environment',
          location: { city: 'Salinas', state: 'CA', coordinates: [36.6777, -121.6555] },
          certifications: ['Organic', 'GAP', 'GLOBALG.A.P.'],
          rating: 4.8,
          reviewCount: 127,
          established: 2015
        },
        product: {
          name: 'Butter Lettuce',
          category: 'Leafy Greens',
          variety: 'Boston Bibb',
          grade: 'A',
          size: 'Medium',
          packaging: '24ct case',
          certifications: ['Organic', 'Non-GMO']
        },
        availability: {
          current: {
            quantity: 500,
            unit: 'cases',
            pricePerUnit: 28.50,
            harvestDate: new Date('2024-01-15'),
            bestBy: new Date('2024-01-22')
          },
          predicted: [
            {
              date: new Date('2024-01-22'),
              quantity: 750,
              confidence: 0.92,
              estimatedPrice: 29.00,
              priceRange: [27.50, 31.00],
              quality: 'premium'
            },
            {
              date: new Date('2024-01-29'),
              quantity: 600,
              confidence: 0.87,
              estimatedPrice: 30.50,
              priceRange: [28.00, 33.00],
              quality: 'premium'
            }
          ]
        },
        logistics: {
          fob: true,
          canDeliver: true,
          maxDeliveryDistance: 200,
          shippingMethods: ['Refrigerated truck', 'Express delivery'],
          leadTime: 1,
          minimumOrder: 50
        },
        quality: {
          brix: 0,
          firmness: 85,
          color: 'Bright green',
          pesticides: false,
          organicStatus: 'certified',
          testResults: [
            {
              type: 'Pesticide residue',
              result: 'None detected',
              date: new Date('2024-01-10'),
              lab: 'AgriTech Labs'
            }
          ]
        },
        volumePricing: [
          { minQuantity: 50, maxQuantity: 199, pricePerUnit: 28.50, discount: 0 },
          { minQuantity: 200, maxQuantity: 499, pricePerUnit: 27.00, discount: 5.3 },
          { minQuantity: 500, maxQuantity: 999, pricePerUnit: 25.50, discount: 10.5 },
          { minQuantity: 1000, maxQuantity: 9999, pricePerUnit: 24.00, discount: 15.8 }
        ],
        negotiable: true,
        lastUpdated: new Date()
      },
      {
        id: '2',
        grower: {
          id: 'grower_2',
          name: 'Heritage Open Fields',
          type: 'open_field',
          location: { city: 'Fresno', state: 'CA', coordinates: [36.7378, -119.7871] },
          certifications: ['GAP', 'Fair Trade'],
          rating: 4.6,
          reviewCount: 89,
          established: 1987
        },
        product: {
          name: 'Roma Tomatoes',
          category: 'Vine Crops',
          variety: 'San Marzano',
          grade: 'A',
          size: 'Medium-Large',
          packaging: '25lb box',
          certifications: ['Fair Trade', 'IPM Certified']
        },
        availability: {
          current: {
            quantity: 1200,
            unit: 'boxes',
            pricePerUnit: 45.00,
            harvestDate: new Date('2024-01-14'),
            bestBy: new Date('2024-01-28')
          },
          predicted: [
            {
              date: new Date('2024-01-21'),
              quantity: 1500,
              confidence: 0.89,
              estimatedPrice: 42.00,
              priceRange: [40.00, 48.00],
              quality: 'premium'
            },
            {
              date: new Date('2024-01-28'),
              quantity: 800,
              confidence: 0.75,
              estimatedPrice: 48.00,
              priceRange: [45.00, 52.00],
              quality: 'standard'
            }
          ]
        },
        logistics: {
          fob: false,
          canDeliver: true,
          maxDeliveryDistance: 500,
          shippingMethods: ['Standard truck', 'Rail'],
          leadTime: 2,
          minimumOrder: 100
        },
        quality: {
          brix: 6.2,
          firmness: 78,
          color: 'Deep red',
          pesticides: false,
          organicStatus: 'conventional',
          testResults: [
            {
              type: 'Brix test',
              result: '6.2°',
              date: new Date('2024-01-12'),
              lab: 'Produce Quality Labs'
            }
          ]
        },
        volumePricing: [
          { minQuantity: 100, maxQuantity: 499, pricePerUnit: 45.00, discount: 0 },
          { minQuantity: 500, maxQuantity: 999, pricePerUnit: 42.00, discount: 6.7 },
          { minQuantity: 1000, maxQuantity: 2499, pricePerUnit: 39.00, discount: 13.3 },
          { minQuantity: 2500, maxQuantity: 9999, pricePerUnit: 36.00, discount: 20.0 }
        ],
        negotiable: true,
        lastUpdated: new Date()
      }
    ];

    setListings(sampleListings);
  };

  const filterListings = () => {
    let filtered = [...listings];

    if (searchTerm) {
      filtered = filtered.filter(listing =>
        listing.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.grower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.product.variety.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(listing => listing.product.category === selectedCategory);
    }

    if (selectedSubcategory) {
      filtered = filtered.filter(listing => listing.product.name === selectedSubcategory);
    }

    filtered = filtered.filter(listing =>
      listing.availability.current.pricePerUnit >= priceRange[0] &&
      listing.availability.current.pricePerUnit <= priceRange[1]
    );

    if (organicOnly) {
      filtered = filtered.filter(listing => listing.quality.organicStatus === 'certified');
    }

    if (minQuantity > 0) {
      filtered = filtered.filter(listing => listing.availability.current.quantity >= minQuantity);
    }

    // Sort listings
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.availability.current.pricePerUnit - b.availability.current.pricePerUnit;
        case 'rating':
          return b.grower.rating - a.grower.rating;
        case 'availability':
          return b.availability.current.quantity - a.availability.current.quantity;
        default:
          return 0;
      }
    });

    setFilteredListings(filtered);
  };

  const startNegotiation = (listing: ProduceListing, quantity: number, proposedPrice: number) => {
    const negotiation: NegotiationOffer = {
      id: `neg_${Date.now()}`,
      listingId: listing.id,
      buyerId: 'current_user',
      sellerId: listing.grower.id,
      quantity,
      proposedPrice,
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      terms: 'Standard terms and conditions apply',
      status: 'pending',
      messages: [],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    };

    setActiveNegotiations(prev => [...prev, negotiation]);
  };

  const getBestVolumePrice = (listing: ProduceListing, quantity: number) => {
    const applicableTier = listing.volumePricing
      .filter(tier => quantity >= tier.minQuantity && quantity <= tier.maxQuantity)
      .sort((a, b) => b.discount - a.discount)[0];
    
    return applicableTier || listing.volumePricing[0];
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const renderListingCard = (listing: ProduceListing) => (
    <div key={listing.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{listing.product.name}</h3>
          <p className="text-gray-400">{listing.product.variety} • {listing.product.grade} Grade</p>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-400">
              {listing.grower.location.city}, {listing.grower.location.state}
            </span>
            <div className="flex items-center gap-1 ml-2">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-400">
                {listing.grower.rating} ({listing.grower.reviewCount})
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">
            {formatPrice(listing.availability.current.pricePerUnit)}
          </div>
          <div className="text-sm text-gray-400">per {listing.availability.current.unit.slice(0, -1)}</div>
        </div>
      </div>

      {/* Grower Info */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-700/50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            listing.grower.type === 'controlled_environment' ? 'bg-blue-400' :
            listing.grower.type === 'open_field' ? 'bg-green-400' : 'bg-purple-400'
          }`} />
          <div>
            <div className="font-medium text-white">{listing.grower.name}</div>
            <div className="text-sm text-gray-400 capitalize">
              {listing.grower.type.replace('_', ' ')} • Est. {listing.grower.established}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          {listing.grower.certifications.slice(0, 2).map(cert => (
            <span key={cert} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
              {cert}
            </span>
          ))}
        </div>
      </div>

      {/* Current Availability */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-700/30 rounded-lg p-3">
          <div className="text-sm text-gray-400 mb-1">Available Now</div>
          <div className="text-lg font-semibold text-white">
            {listing.availability.current.quantity.toLocaleString()} {listing.availability.current.unit}
          </div>
          <div className="text-xs text-gray-500">
            Harvested {listing.availability.current.harvestDate.toLocaleDateString()}
          </div>
        </div>
        <div className="bg-gray-700/30 rounded-lg p-3">
          <div className="text-sm text-gray-400 mb-1">Quality</div>
          <div className="flex items-center gap-1 mb-1">
            <div className="text-sm font-medium text-white">{listing.product.grade} Grade</div>
            {listing.quality.organicStatus === 'certified' && (
              <Shield className="w-4 h-4 text-green-400" />
            )}
          </div>
          <div className="text-xs text-gray-500">
            {listing.quality.organicStatus === 'certified' ? 'Certified Organic' : 'Conventional'}
          </div>
        </div>
      </div>

      {/* Predicted Availability */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          Predicted Availability
        </div>
        <div className="space-y-2">
          {listing.availability.predicted.slice(0, 2).map((prediction, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-700/20 rounded">
              <div className="text-sm">
                <div className="text-white">{prediction.date.toLocaleDateString()}</div>
                <div className="text-gray-400">{prediction.quantity.toLocaleString()} {listing.availability.current.unit}</div>
              </div>
              <div className="text-right text-sm">
                <div className="text-white">{formatPrice(prediction.estimatedPrice)}</div>
                <div className="text-gray-400">{Math.round(prediction.confidence * 100)}% confidence</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Volume Pricing */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-300 mb-2">Volume Pricing</div>
        <div className="grid grid-cols-2 gap-2">
          {listing.volumePricing.slice(0, 4).map((tier, index) => (
            <div key={index} className="text-xs p-2 bg-gray-700/20 rounded">
              <div className="text-gray-400">{tier.minQuantity}+ {listing.availability.current.unit}</div>
              <div className="text-white font-medium">{formatPrice(tier.pricePerUnit)}</div>
              {tier.discount > 0 && (
                <div className="text-green-400">{tier.discount.toFixed(1)}% off</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1">
          <ShoppingCart className="w-4 h-4" />
          Quick Order
        </button>
        {listing.negotiable && (
          <button 
            onClick={() => startNegotiation(listing, listing.logistics.minimumOrder, listing.availability.current.pricePerUnit * 0.95)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
          >
            <MessageSquare className="w-4 h-4" />
            Negotiate
          </button>
        )}
        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">VibeLux Produce Marketplace</h1>
              <p className="text-gray-400 mt-1">
                Connect with {listings.length} growers • Fresh produce with predictive availability
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400" />
                <select 
                  value={userType} 
                  onChange={(e) => setUserType(e.target.value as 'buyer' | 'seller')}
                  className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2"
                >
                  <option value="buyer">I'm Buying</option>
                  <option value="seller">I'm Selling</option>
                </select>
              </div>
              {userType === 'buyer' && (
                <button 
                  onClick={() => setShowNegotiations(!showNegotiations)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Negotiations ({activeNegotiations.length})
                </button>
              )}
              {userType === 'seller' && (
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                  List Your Produce
                </button>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search produce, growers, or varieties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory('');
                }}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
              >
                <option value="">All Categories</option>
                {PRODUCE_CATEGORIES.map(category => (
                  <option key={category.name} value={category.name}>{category.name}</option>
                ))}
              </select>
              {selectedCategory && (
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                >
                  <option value="">All {selectedCategory}</option>
                  {PRODUCE_CATEGORIES.find(c => c.name === selectedCategory)?.subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white hover:bg-gray-700 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Price Range</label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-400">
                        ${priceRange[0]} - ${priceRange[1]}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Maximum Distance</label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="2000"
                        value={maxDistance}
                        onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-sm text-gray-400">{maxDistance} miles</div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Quantity</label>
                    <input
                      type="number"
                      value={minQuantity}
                      onChange={(e) => setMinQuantity(parseInt(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Certifications</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={organicOnly}
                          onChange={(e) => setOrganicOnly(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                        />
                        <span className="text-sm text-gray-300">Organic Only</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={inSeasonOnly}
                          onChange={(e) => setInSeasonOnly(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                        />
                        <span className="text-sm text-gray-300">In Season Only</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sort and View Options */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-gray-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white"
                >
                  <option value="price">Price</option>
                  <option value="distance">Distance</option>
                  <option value="availability">Availability</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
              <div className="text-gray-400">
                {filteredListings.length} listings found
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marketplace Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {showNegotiations && userType === 'buyer' && (
          <div className="mb-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Active Negotiations</h2>
            {activeNegotiations.length === 0 ? (
              <p className="text-gray-400">No active negotiations</p>
            ) : (
              <div className="space-y-4">
                {activeNegotiations.map(negotiation => (
                  <div key={negotiation.id} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-white">
                          Negotiation #{negotiation.id.slice(-6)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {negotiation.quantity.toLocaleString()} units at {formatPrice(negotiation.proposedPrice)}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        negotiation.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        negotiation.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {negotiation.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredListings.map(renderListingCard)}
        </div>
      </div>
    </div>
  );
}