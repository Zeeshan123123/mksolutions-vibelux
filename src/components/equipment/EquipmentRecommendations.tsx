'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ExternalLink, Star, TrendingUp, ShoppingCart,
  Zap, Award, Package, AlertCircle, ChevronRight
} from 'lucide-react';
import { 
  generateAffiliateLink, 
  trackAffiliateClick,
  getRecommendedProducts,
  generateEquipmentComparison,
  FEATURED_PRODUCTS
} from '@/lib/amazon-affiliate';

interface EquipmentRecommendationsProps {
  calculatedRequirements?: {
    wattage?: number;
    coverage?: number;
    ppfd?: number;
  };
  category?: 'lighting' | 'environmental' | 'nutrients';
  userProfile?: {
    facilitySize?: number;
    experience?: 'beginner' | 'intermediate' | 'advanced';
  };
}

export function EquipmentRecommendations({
  calculatedRequirements,
  category = 'lighting',
  userProfile
}: EquipmentRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    if (calculatedRequirements) {
      const comparisons = generateEquipmentComparison(calculatedRequirements, category);
      setRecommendations(comparisons);
    } else if (userProfile) {
      const recommended = getRecommendedProducts(userProfile);
      setRecommendations(recommended.map(product => ({
        product,
        matchScore: 85,
        affiliateLink: generateAffiliateLink(product.asin),
        recommendation: 'Recommended for your setup'
      })));
    }
  }, [calculatedRequirements, category, userProfile]);

  const handleProductClick = async (asin: string) => {
    await trackAffiliateClick(asin, undefined, `equipment-${category}`);
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-900/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-900/20';
    return 'text-orange-400 bg-orange-900/20';
  };

  const getFeaturedProducts = () => {
    switch (category) {
      case 'lighting':
        return FEATURED_PRODUCTS.lights;
      case 'environmental':
        return FEATURED_PRODUCTS.controllers;
      case 'nutrients':
        return FEATURED_PRODUCTS.nutrients;
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Amazon Affiliate Notice */}
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-blue-400 mb-1">
              Equipment Recommendations Powered by Amazon
            </p>
            <p className="text-xs text-gray-400">
              As an Amazon Associate, VibeLux earns from qualifying purchases. 
              This helps us maintain free calculators and tools for the growing community.
            </p>
          </div>
        </div>
      </div>

      {/* Calculated Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Recommended Equipment for Your Setup
            </h3>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              {showComparison ? 'Hide' : 'Show'} Comparison
            </button>
          </div>

          {/* Product Cards */}
          <div className="grid gap-4">
            {recommendations.slice(0, 3).map((rec, index) => (
              <div
                key={rec.product.asin}
                className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold mb-2">
                      {rec.product.title}
                    </h4>
                    <div className="flex items-center gap-4 mb-3">
                      <span className={`text-sm px-3 py-1 rounded-full ${getMatchColor(rec.matchScore)}`}>
                        {rec.matchScore}% Match
                      </span>
                      <span className="text-gray-400 text-sm">
                        {rec.product.category}
                      </span>
                    </div>
                  </div>
                  {rec.product.price && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        ${rec.product.price}
                      </div>
                      <div className="text-xs text-gray-500">on Amazon</div>
                    </div>
                  )}
                </div>

                {/* Features */}
                {rec.product.features && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {rec.product.features.slice(0, 3).map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                )}

                {/* Recommendation */}
                <p className="text-sm text-gray-400 mb-4">
                  {rec.recommendation}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <a
                    href={rec.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleProductClick(rec.product.asin)}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    View on Amazon
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <Star className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Match Details (if comparing) */}
                {showComparison && calculatedRequirements && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Your Requirement:</span>
                        <span className="text-white ml-2">{calculatedRequirements.wattage}W</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Product Output:</span>
                        <span className="text-white ml-2">
                          {rec.product.features?.find((f: string) => f.includes('W')) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Products Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">
          Popular {category === 'lighting' ? 'Grow Lights' : 'Equipment'} on Amazon
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {getFeaturedProducts().map((product) => (
            <a
              key={product.asin}
              href={generateAffiliateLink(product.asin)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleProductClick(product.asin)}
              className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium group-hover:text-purple-400 transition-colors">
                  {product.title}
                </h4>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-gray-400">Amazon's Choice</span>
                </div>
                {product.price && (
                  <span className="text-lg font-semibold text-green-400">
                    ${product.price}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>

        {/* Browse More Link */}
        <div className="mt-4 text-center">
          <a
            href={`https://www.amazon.com/s?k=grow+${category}&tag=whaisurbfar-20`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            Browse more {category} equipment on Amazon
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Educational Content */}
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-800/30">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <Zap className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">
              Pro Tip: Calculate Before You Buy
            </h4>
            <p className="text-gray-400 text-sm mb-3">
              Use our professional calculators to determine exact equipment requirements 
              before making a purchase. This ensures you get the right size and avoid 
              costly mistakes.
            </p>
            <Link
              href="/calculators"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm"
            >
              View all calculators
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}