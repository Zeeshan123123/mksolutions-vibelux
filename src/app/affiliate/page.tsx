'use client';

import { useState } from 'react';
import AffiliateRegistration from '@/components/affiliate/AffiliateRegistration';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Award, 
  Shield, 
  Zap,
  CheckCircle,
  BarChart3,
  Target,
  Gift,
  ArrowRight,
  UserPlus,
  Share2,
  ChevronRight,
  X
} from 'lucide-react';

const SUCCESS_STORIES = [
  {
    name: 'Sarah M.',
    role: 'Cannabis Blogger',
    earnings: '$3,450/mo',
    testimonial: 'VibeLux has been a game-changer. My audience loves the platform and the commissions are fantastic!'
  },
  {
    name: 'Mike T.',
    role: 'YouTube Creator',
    earnings: '$8,200/mo',
    testimonial: 'The recurring commissions mean I earn from every referral for a full year. Best affiliate program I\'ve joined.'
  },
  {
    name: 'GrowTech Solutions',
    role: 'Industry Consultant',
    earnings: '$15,000/mo',
    testimonial: 'Our clients trust our recommendations. VibeLux delivers on quality and our commissions reflect that.'
  }
];

const FAQ_ITEMS = [
  {
    question: 'How much can I earn?',
    answer: 'You earn 20-40% commission on all referred subscriptions for life with decreasing rates. VIP affiliates earn $25,000+ per month.'
  },
  {
    question: 'When do I get paid?',
    answer: 'Payouts are processed weekly or daily based on your tier. Minimum payout is $50.'
  },
  {
    question: 'What marketing materials do you provide?',
    answer: 'We provide banners, email templates, landing pages, and custom marketing materials for higher tiers.'
  },
  {
    question: 'How long do cookies last?',
    answer: 'Our tracking cookies last 30 days, giving your referrals plenty of time to convert.'
  },
  {
    question: 'Can I promote on paid ads?',
    answer: 'Yes! We allow PPC advertising with some restrictions. No bidding on branded terms.'
  }
];

export default function AffiliatePage() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Earn <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">40% Lifetime</span> Commissions
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Join the VibeLux Affiliate Program and earn industry-leading commissions 
              by promoting the future of controlled environment agriculture.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => setShowRegistration(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                Start Earning Today
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#how-it-works"
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all"
              >
                Learn More
              </a>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-400">40%</div>
                <div className="text-sm text-gray-400">Max Commission</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold text-green-400">Lifetime</div>
                <div className="text-sm text-gray-400">Duration</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-400">30 Days</div>
                <div className="text-sm text-gray-400">Cookie Duration</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-400">$50</div>
                <div className="text-sm text-gray-400">Min Payout</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">1. Sign Up</h3>
              <p className="text-gray-400">
                Join our affiliate program in minutes. Get instant access to your dashboard and marketing materials.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">2. Share</h3>
              <p className="text-gray-400">
                Promote VibeLux using your unique referral link. Share on your blog, social media, or email list.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">3. Earn</h3>
              <p className="text-gray-400">
                Earn up to 40% commission on every subscription for life. Get paid weekly, daily, or instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Commission Tiers */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Commission Tiers</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-amber-600/50">
              <Award className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Bronze</h3>
              <div className="text-3xl font-bold text-amber-600 mb-4">20%</div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  0-5 active referrals
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Monthly payouts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Basic materials
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-400/50">
              <Award className="w-8 h-8 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Silver</h3>
              <div className="text-3xl font-bold text-gray-400 mb-4">25%</div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  6-20 active referrals
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Weekly payouts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Premium banners
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 border border-yellow-500/50">
              <Award className="w-8 h-8 text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Gold</h3>
              <div className="text-3xl font-bold text-yellow-500 mb-4">30%</div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  21-50 active referrals
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Daily payouts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Custom landing pages
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 border border-purple-600/50">
              <Award className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Platinum</h3>
              <div className="text-3xl font-bold text-purple-600 mb-4">35%</div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  51+ active referrals
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Instant payouts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  White-label options
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 border border-pink-600/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-pink-600 text-white text-xs px-2 py-1 rounded-bl-lg font-semibold">
                EXCLUSIVE
              </div>
              <Award className="w-8 h-8 text-pink-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">VIP</h3>
              <div className="text-3xl font-bold text-pink-600 mb-4">40%</div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  100+ referrals + $100K revenue
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Dedicated account manager
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Custom demo environments
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Revenue sharing on enterprise
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Success Stories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SUCCESS_STORIES.map((story, index) => (
              <div key={index} className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-white">{story.name}</h4>
                    <p className="text-sm text-gray-400">{story.role}</p>
                  </div>
                  <div className="text-2xl font-bold text-green-400">{story.earnings}</div>
                </div>
                <p className="text-gray-300 italic">"{story.testimonial}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-700 transition-colors"
                >
                  <span className="font-medium text-white">{item.question}</span>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedFaq === index ? 'rotate-90' : ''
                  }`} />
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-400">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of successful affiliates earning recurring commissions with VibeLux
          </p>
          <button
            onClick={() => setShowRegistration(true)}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all inline-flex items-center gap-2"
          >
            Apply Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Registration Modal */}
      {showRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-auto">
            <AffiliateRegistration
              onSuccess={() => {
                setShowRegistration(false);
                alert('Application submitted successfully! Check your email for next steps.');
              }}
            />
            <button
              onClick={() => setShowRegistration(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}