'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { logger } from '@/lib/client-logger';
import {
  ShoppingCart,
  Package,
  TrendingUp,
  Search,
  Filter,
  Star,
  DollarSign,
  Truck,
  FileText,
  Users,
  BarChart3,
  Plus,
  CheckCircle,
  AlertCircle,
  Minus,
  X,
  CreditCard,
  ShoppingBag
} from 'lucide-react';
import { MarketplaceManager, Product, Vendor, GeneticListing } from '@/lib/marketplace/marketplace-manager';

const marketplaceManager = new MarketplaceManager();

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export function MarketplaceDashboard() {
  const [activeTab, setActiveTab] = useState<'browse' | 'suppliers' | 'orders' | 'cart'>('browse');
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [genetics, setGenetics] = useState<GeneticListing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<any>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load initial data
    loadProducts();
    loadVendors();
    loadGenetics();
    loadStats();

    // Subscribe to events
    marketplaceManager.on('productListed', loadProducts);
    marketplaceManager.on('vendorRegistered', loadVendors);
    marketplaceManager.on('geneticsListed', loadGenetics);

    return () => {
      marketplaceManager.removeListener('productListed', loadProducts);
      marketplaceManager.removeListener('vendorRegistered', loadVendors);
      marketplaceManager.removeListener('geneticsListed', loadGenetics);
    };
  }, []);

  const loadProducts = () => {
    const filters = selectedCategory === 'all' ? {} : { category: selectedCategory };
    setProducts(marketplaceManager.searchProducts({ ...filters, search: searchTerm }));
  };

  const loadVendors = () => {
    setVendors(marketplaceManager.searchVendors({ verified: true }));
  };

  const loadGenetics = () => {
    setGenetics(marketplaceManager.searchGenetics({}));
  };

  const loadStats = () => {
    setStats(marketplaceManager.getMarketplaceStats());
  };

  const addToCart = useCallback(async (product: Product, quantity: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Optimistic update
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.productId === product.id);
        if (existingItem) {
          return prevCart.map(item =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          return [...prevCart, { productId: product.id, product, quantity }];
        }
      });

      // TODO: Replace with actual API call when database is integrated
      // await fetch('/api/marketplace/cart', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ productId: product.id, quantity, price: product.pricing.list })
      // });
      
    } catch (err) {
      setError('Failed to add item to cart');
      logger.error('system', 'Cart error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.product.pricing.list * item.quantity), 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const getCartTotal = useCallback(() => cartTotal, [cartTotal]);
  const getCartItemCount = useCallback(() => cartItemCount, [cartItemCount]);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, searchTerm]);

  const categories = [
    { id: 'all', name: 'All Products', icon: Package },
    { id: 'leafy-greens', name: 'Leafy Greens', icon: Package },
    { id: 'tomatoes', name: 'Tomatoes', icon: Package },
    { id: 'peppers', name: 'Peppers', icon: Package },
    { id: 'cucumbers', name: 'Cucumbers', icon: Package },
    { id: 'herbs', name: 'Fresh Herbs', icon: Package }
  ];

  return (
    <div className="marketplace-container min-h-screen bg-black text-white p-6 w-full overflow-x-hidden">
      {/* Header */}
      <div className="marketplace-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Fresh Produce Marketplace</h1>
          <p className="text-gray-400">Connect with local growers and buy fresh vegetables and produce</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            onClick={() => setShowCart(true)}
            className="relative px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Cart
            {getCartItemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getCartItemCount()}
              </span>
            )}
          </button>
          <Link
            href="/marketplace/grower-signup"
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Users className="w-5 h-5" />
            Become a Grower
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="marketplace-stats grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Partner Farms</span>
            <Users className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold">{stats.totalVendors || 3}</div>
          <div className="text-sm text-green-400">Beta partners</div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Available Today</span>
            <Package className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold">{stats.totalProducts || 24}</div>
          <div className="text-sm text-gray-400">Boxes ready</div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Produce Types</span>
            <Package className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold">{stats.totalGenetics || 8}</div>
          <div className="text-sm text-gray-400">Varieties</div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">This Week</span>
            <ShoppingCart className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-2xl font-bold">{stats.activeOrders || 12}</div>
          <div className="text-sm text-gray-400">Orders fulfilled</div>
        </div>

        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Coverage Area</span>
            <Truck className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold">{stats.avgDelivery || '15'} mi</div>
          <div className="text-sm text-gray-400">Radius</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="marketplace-tabs flex flex-wrap gap-1 mb-6 bg-gray-900 p-1 rounded-xl overflow-x-auto">
        {[
          { id: 'browse', label: 'Browse Products', icon: Package },
          { id: 'suppliers', label: 'Suppliers', icon: Users },
          { id: 'orders', label: 'My Orders', icon: ShoppingCart },
          { id: 'cart', label: `Cart (${getCartItemCount()})`, icon: ShoppingBag }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-300 hover:text-red-100"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Browse Products Tab */}
      {activeTab === 'browse' && (
        <div>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                aria-label="Search products in marketplace"
                role="searchbox"
              />
            </div>
            <button className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="marketplace-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map(product => {
              const vendor = marketplaceManager.getVendor(product.vendorId);
              return (
                <div key={product.id} className="bg-gray-900 rounded-xl overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all">
                  <div className="aspect-video bg-gray-800 relative flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-600" />
                    {product.availability === 'in-stock' && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-green-600 text-white text-xs rounded">
                        In Stock
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{product.name || 'Fresh Organic Lettuce'}</h3>
                    <p className="text-gray-400 text-sm mb-2">{product.brand || 'Grade A'}</p>
                    
                    {vendor && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-gray-500">by {vendor.name}</span>
                        {vendor.verified && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                    )}
                    
                    {/* Fresh Produce Details */}
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="bg-gray-800 rounded p-2">
                        <span className="text-gray-400">Box Size:</span>
                        <span className="ml-1 font-medium">24 ct</span>
                      </div>
                      <div className="bg-gray-800 rounded p-2">
                        <span className="text-gray-400">Weight:</span>
                        <span className="ml-1 font-medium">12 lbs</span>
                      </div>
                      <div className="bg-gray-800 rounded p-2">
                        <span className="text-gray-400">Harvest:</span>
                        <span className="ml-1 font-medium">Today</span>
                      </div>
                      <div className="bg-gray-800 rounded p-2">
                        <span className="text-gray-400">Delivery:</span>
                        <span className="ml-1 font-medium text-green-400">Next day</span>
                      </div>
                    </div>
                    
                    {/* Freshness & Delivery */}
                    <div className="bg-green-900/20 border border-green-600/30 rounded p-2 mb-3">
                      <div className="flex items-center gap-2 text-xs">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-green-400">Next-day delivery available</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Harvested fresh • Local farm • Beta program
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-2xl font-bold">${product.pricing.list || 28}</div>
                        <div className="text-sm text-gray-400">per box</div>
                      </div>
                      {vendor && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm">{vendor.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => addToCart(product)}
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add to Cart
                      </button>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <div className="marketplace-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vendors.map(vendor => (
            <div key={vendor.id} className="bg-gray-900 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{vendor.name}</h3>
                  <p className="text-sm text-gray-400 capitalize">Local Farm</p>
                </div>
                {vendor.verified && (
                  <div className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">
                    Organic
                  </div>
                )}
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{vendor.rating} ({vendor.reviewCount})</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Min Order</span>
                  <span>{vendor.minimumOrder || 5} boxes</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Delivery</span>
                  <span className="text-green-400">Next day</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Distance</span>
                  <span>8 miles</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {(vendor.specialties || ['Leafy Greens', 'Tomatoes', 'Herbs']).slice(0, 3).map((specialty, idx) => (
                  <span key={idx} className="px-2 py-1 bg-green-800/30 text-green-300 text-xs rounded">
                    {specialty}
                  </span>
                ))}
              </div>
              
              <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                View Products
              </button>
            </div>
          ))}
        </div>
      )}


      {/* Cart Tab */}
      {activeTab === 'cart' && (
        <div>
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Your cart is empty</h3>
              <p className="text-gray-400 mb-6">Add some products to get started</p>
              <button
                onClick={() => setActiveTab('browse')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.productId} className="bg-gray-900 rounded-xl p-6 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{item.product.name}</h3>
                    <p className="text-sm text-gray-400">{item.product.brand}</p>
                    <p className="text-lg font-bold text-white">${item.product.pricing.list}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">
                      ${(item.product.pricing.list * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="bg-gray-900 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-semibold text-white">Total</span>
                  <span className="text-2xl font-bold text-white">${getCartTotal().toFixed(2)}</span>
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCart(false)}></div>
          <div className="absolute right-0 top-0 h-full w-96 bg-gray-900 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Shopping Cart</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.productId} className="bg-gray-800 rounded-lg p-4">
                    <h3 className="font-medium text-white text-sm">{item.product.name}</h3>
                    <p className="text-xs text-gray-400 mb-2">{item.product.brand}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 bg-gray-700 text-white rounded flex items-center justify-center hover:bg-gray-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-white text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 bg-gray-700 text-white rounded flex items-center justify-center hover:bg-gray-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-white font-medium">
                        ${(item.product.pricing.list * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-xl font-bold text-white">${getCartTotal().toFixed(2)}</span>
                  </div>
                  <button className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="fixed bottom-6 right-6 space-y-3">
        <Link
          href="/marketplace/sell-produce"
          className="block p-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors"
          title="Sell Your Produce"
        >
          <Package className="w-5 h-5" />
        </Link>
        <Link
          href="/marketplace/track-delivery"
          className="block p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Track Delivery"
        >
          <Truck className="w-5 h-5" />
        </Link>
        <button 
          onClick={() => {
            setActiveTab('browse');
          }}
          className="p-4 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
          title="Browse Fresh Produce"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}