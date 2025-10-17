'use client';

import React, { useState } from 'react';
import { logger } from '@/lib/client-logger';
import { 
  UserPlus, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Award,
  CheckCircle,
  ArrowRight,
  Zap,
  Target,
  BarChart3,
  Shield,
  Clock,
  Gift
} from 'lucide-react';

interface AffiliateRegistrationProps {
  userId?: string;
  onSuccess?: () => void;
  className?: string;
}

const COMMISSION_TIERS = [
  {
    name: 'Bronze',
    color: 'amber',
    requirements: '0-5 active referrals',
    commission: '20%',
    benefits: ['Basic marketing materials', 'Monthly payouts', 'Email support']
  },
  {
    name: 'Silver',
    color: 'gray',
    requirements: '6-20 active referrals',
    commission: '25%',
    benefits: ['Premium banners', 'Weekly payouts', 'Priority support', 'Landing page templates']
  },
  {
    name: 'Gold',
    color: 'yellow',
    requirements: '21-50 active referrals',
    commission: '30%',
    benefits: ['Custom landing pages', 'Daily payouts', 'Dedicated account manager', 'API access']
  },
  {
    name: 'Platinum',
    color: 'purple',
    requirements: '51+ active referrals',
    commission: '35%',
    benefits: ['White-label options', 'Instant payouts', 'Custom integrations', 'Co-marketing opportunities']
  }
];

const PROGRAM_FEATURES = [
  {
    icon: DollarSign,
    title: 'High Commissions',
    description: 'Earn up to 35% recurring commission on all referrals'
  },
  {
    icon: Clock,
    title: '12-Month Recurring',
    description: 'Get paid for 12 months on every subscription'
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Track clicks, conversions, and earnings in real-time'
  },
  {
    icon: Shield,
    title: '6-Month Cookie',
    description: 'Industry-leading 180-day attribution window'
  },
  {
    icon: Gift,
    title: 'Marketing Resources',
    description: 'Access banners, email templates, and landing pages'
  },
  {
    icon: Zap,
    title: 'Fast Payouts',
    description: 'Weekly or daily payouts based on your tier'
  }
];

export default function AffiliateRegistration({ 
  userId, 
  onSuccess, 
  className = '' 
}: AffiliateRegistrationProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    website: '',
    audience: '',
    experience: '',
    promotionMethod: '',
    expectedReferrals: '',
    affiliateCode: '',
    paymentMethod: 'stripe',
    paymentEmail: '',
    agreeToTerms: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/affiliate/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData
        })
      });

      if (response.ok) {
        onSuccess?.();
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } catch (error) {
      logger.error('system', 'Registration error:', error );
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.fullName && formData.email && formData.website;
      case 2:
        return formData.audience && formData.experience && formData.promotionMethod;
      case 3:
        return formData.paymentMethod && formData.paymentEmail && formData.agreeToTerms;
      default:
        return false;
    }
  };

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-8 text-center border-b border-gray-700">
        <UserPlus className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Join the VibeLux Affiliate Program</h2>
        <p className="text-gray-400">Earn recurring commissions by promoting the future of indoor growing</p>
      </div>

      {/* Progress Steps */}
      <div className="px-8 py-6 border-b border-gray-700">
        <div className="flex items-center justify-center">
          {[1, 2, 3].map((i) => (
            <React.Fragment key={i}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                step >= i 
                  ? 'bg-purple-600 border-purple-600 text-white' 
                  : 'bg-gray-700 border-gray-600 text-gray-400'
              }`}>
                {step > i ? <CheckCircle className="w-5 h-5" /> : i}
              </div>
              {i < 3 && (
                <div className={`w-24 h-0.5 transition-all ${
                  step > i ? 'bg-purple-600' : 'bg-gray-600'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-around mt-3">
          <span className={`text-sm ${step >= 1 ? 'text-purple-400' : 'text-gray-500'}`}>Basic Info</span>
          <span className={`text-sm ${step >= 2 ? 'text-purple-400' : 'text-gray-500'}`}>Audience</span>
          <span className={`text-sm ${step >= 3 ? 'text-purple-400' : 'text-gray-500'}`}>Payment</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-8">
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Tell us about yourself</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Website/Social Media *</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Preferred Affiliate Code (optional)
              </label>
              <input
                type="text"
                name="affiliateCode"
                value={formData.affiliateCode}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                placeholder="Leave blank for auto-generated code"
              />
              <p className="mt-1 text-xs text-gray-500">
                This will be used in your referral links (e.g., vibelux.com?ref=yourcode)
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">About your audience</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Describe Your Audience *
              </label>
              <textarea
                name="audience"
                value={formData.audience}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                placeholder="Tell us about your audience - size, interests, demographics, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Experience Level *
              </label>
              <select
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-400 focus:outline-none"
              >
                <option value="">Select experience level</option>
                <option value="beginner">New to affiliate marketing</option>
                <option value="intermediate">Some experience (1-2 years)</option>
                <option value="advanced">Experienced (3+ years)</option>
                <option value="expert">Expert/Agency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                How will you promote VibeLux? *
              </label>
              <select
                name="promotionMethod"
                value={formData.promotionMethod}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-400 focus:outline-none"
              >
                <option value="">Select primary method</option>
                <option value="content">Content Marketing (Blog/YouTube)</option>
                <option value="social">Social Media</option>
                <option value="email">Email Marketing</option>
                <option value="paid">Paid Advertising</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Expected Monthly Referrals
              </label>
              <select
                name="expectedReferrals"
                value={formData.expectedReferrals}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-400 focus:outline-none"
              >
                <option value="">Select range</option>
                <option value="1-5">1-5 referrals</option>
                <option value="6-20">6-20 referrals</option>
                <option value="21-50">21-50 referrals</option>
                <option value="50+">50+ referrals</option>
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Payment Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Method *
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-400 focus:outline-none"
              >
                <option value="stripe">Stripe (Recommended)</option>
                <option value="paypal">PayPal</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Email *
              </label>
              <input
                type="email"
                name="paymentEmail"
                value={formData.paymentEmail}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                placeholder="payment@example.com"
              />
              <p className="mt-1 text-xs text-gray-500">
                This email will be used for payment processing
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1"
                />
                <span className="text-sm text-gray-300">
                  I agree to the VibeLux Affiliate Program Terms and Conditions, 
                  including the commission structure and payout terms
                </span>
              </label>
            </div>

            <div className="p-4 bg-gray-900 rounded-lg">
              <h4 className="font-medium text-white mb-2">Important Notes:</h4>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>• Minimum payout threshold is $50</li>
                <li>• Commissions are paid based on your tier</li>
                <li>• Applications are reviewed within 24-48 hours</li>
                <li>• You'll receive an email once approved</li>
              </ul>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Back
            </button>
          )}
          
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Application
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Program Benefits */}
      <div className="p-8 bg-gray-900/50 border-t border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-6 text-center">Why Join Our Affiliate Program?</h3>
        
        <div className="grid grid-cols-3 gap-6 mb-8">
          {PROGRAM_FEATURES.map((feature, index) => (
            <div key={index} className="text-center">
              <feature.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h4 className="font-medium text-white mb-1">{feature.title}</h4>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Commission Tiers */}
        <h4 className="text-lg font-semibold text-white mb-4 text-center">Commission Tiers</h4>
        <div className="grid grid-cols-4 gap-4">
          {COMMISSION_TIERS.map((tier, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4 text-center">
              <Award className={`w-8 h-8 text-${tier.color}-400 mx-auto mb-2`} />
              <h5 className="font-medium text-white mb-1">{tier.name}</h5>
              <div className="text-2xl font-bold text-purple-400 mb-2">{tier.commission}</div>
              <p className="text-xs text-gray-500 mb-3">{tier.requirements}</p>
              <ul className="space-y-1">
                {tier.benefits.map((benefit, i) => (
                  <li key={i} className="text-xs text-gray-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}