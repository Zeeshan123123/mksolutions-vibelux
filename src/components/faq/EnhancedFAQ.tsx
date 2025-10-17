'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Star,
  Clock,
  Tag,
  ExternalLink,
  MessageCircle,
  BookOpen,
  Users,
  HelpCircle,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  X,
  ArrowRight
} from 'lucide-react';
import { NavigationLayout } from '@/components/navigation/NavigationLayout';
import { KeyboardNavigation, useKeyboardShortcuts } from '@/components/accessibility/KeyboardNavigation';
import { useAccessibility } from '@/components/accessibility/AccessibilityProvider';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { useNotifications } from '@/components/ui/NotificationSystem';
import { ProtectedDocumentViewer } from '@/components/docs/ProtectedDocumentViewer';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  popularity: number;
  helpful: number;
  notHelpful: number;
  lastUpdated: string;
  relatedQuestions: string[];
  isPremium?: boolean;
  isNew?: boolean;
}

interface FAQCategory {
  id: string;
  name: string;
  icon: any;
  description: string;
  count: number;
}

const faqCategories: FAQCategory[] = [
  { id: 'all', name: 'All Categories', icon: BookOpen, description: 'Browse all questions', count: 0 },
  { id: 'getting-started', name: 'Getting Started', icon: Lightbulb, description: 'New user onboarding', count: 0 },
  { id: 'design-studio', name: 'Design Studio', icon: Users, description: '3D design and modeling', count: 0 },
  { id: 'calculators', name: 'Calculators', icon: Users, description: 'Tools and calculations', count: 0 },
  { id: 'automation-ai', name: 'Automation & AI', icon: Users, description: 'AI features and automation', count: 0 },
  { id: 'monitoring', name: 'Monitoring', icon: Users, description: 'Sensors and data tracking', count: 0 },
  { id: 'business', name: 'Business & Pricing', icon: Users, description: 'Plans, billing, and ROI', count: 0 },
  { id: 'technical', name: 'Technical', icon: Users, description: 'API, integrations, and troubleshooting', count: 0 },
  { id: 'support', name: 'Support', icon: HelpCircle, description: 'Help and customer service', count: 0 },
];

// Mock FAQ data - would come from API in production
const mockFAQs: FAQItem[] = [
  {
    id: "getting-started-1",
    category: "Getting Started",
    question: "What is VibeLux and who is it for?",
    answer: "VibeLux is a comprehensive controlled environment agriculture (CEA) platform designed for commercial growers, consultants, researchers, and facility managers. We combine advanced 3D design tools, real-time monitoring, AI-powered optimization, and business intelligence to help you maximize yield, reduce costs, and optimize your entire growing operation.\n\nOur platform serves:\n• Commercial cannabis and vegetable growers\n• Vertical farming operations\n• Greenhouse managers\n• Lighting consultants and designers\n• Research institutions\n• Equipment manufacturers and suppliers\n• Facility investors and operators",
    tags: ["overview", "target audience", "commercial", "growers"],
    popularity: 95,
    helpful: 124,
    notHelpful: 8,
    lastUpdated: "2024-01-15",
    relatedQuestions: ["getting-started-2", "getting-started-3"],
    isNew: false
  },
  {
    id: 'ipm-1',
    category: 'Monitoring',
    question: 'How does Field Scouting (IPM) work in VibeLux?',
    answer: 'Open the Field Scouting app to capture photos (mobile camera supported). We auto-tag GPS and let you classify the issue (pest/disease/nutrient/environmental) and severity. Submissions are saved as Scouting Records with photos, notes, and location. High/Critical findings automatically mark Action Required and create a task; managers receive notifications. View and filter history, see map pins, export CSV/PDF weekly reports, and drill into a report to assign or add notes. You can jump to Compliance to record a pesticide application when needed.',
    tags: ['scouting', 'ipm', 'mobile', 'compliance', 'alerts', 'csv', 'pdf'],
    popularity: 88,
    helpful: 120,
    notHelpful: 5,
    lastUpdated: '2025-08-13',
    relatedQuestions: []
  },
  {
    id: 'ipm-2',
    category: 'Monitoring',
    question: 'Can I export my scouting data?',
    answer: 'Yes. From Scouting History you can export a CSV for any date range and generate a branded PDF summary report. Both support facility scoping when applicable.',
    tags: ['export', 'csv', 'pdf', 'reports'],
    popularity: 76,
    helpful: 64,
    notHelpful: 3,
    lastUpdated: '2025-08-13',
    relatedQuestions: []
  },
  {
    id: 'ipm-3',
    category: 'Monitoring',
    question: 'Do managers get notified for severe findings?',
    answer: 'Yes. High/Critical submissions notify facility OWNER/ADMIN/MANAGER users and auto-create a task when Action Required is set (automatic if severity is high/critical or when you toggle it). You can also assign to a specific user from the report detail.',
    tags: ['alerts', 'notifications', 'tasks'],
    popularity: 79,
    helpful: 72,
    notHelpful: 4,
    lastUpdated: '2025-08-13',
    relatedQuestions: []
  },
  {
    id: 'sop-audit-1',
    category: 'Technical',
    question: 'How are SOP check-ins and edits audited? Who signed off?',
    answer: 'Each SOP check-in records the authenticated user, start/end times, completion rate, and optional facility/location/batch context. We also record metadata like client IP and user agent for accountability. SOP edits are versioned: a revision entry stores who changed it, when, the previous version, and a change log/diff summary. Completed check-ins can be verified by a reviewer, stamping verifiedBy/verifiedAt. This provides a complete audit trail for compliance and QA.\n\nTip: Use the Recent Activity feed in the SOP manager to view revisions and check-ins (who/when/IP/UA).',
    tags: ['SOP', 'audit', 'compliance', 'check-in', 'revisions'],
    popularity: 80,
    helpful: 97,
    notHelpful: 6,
    lastUpdated: '2025-08-12',
    relatedQuestions: []
  },
  {
    id: "design-1",
    category: "Design Studio",
    question: "What can I design with VibeLux's 3D tools?",
    answer: "Our Advanced Designer Suite provides comprehensive 3D modeling capabilities:\n\n**Facility Design:**\n• Complete room modeling with precise dimensions\n• Multi-tier rack systems for vertical farming\n• Polygon room editor for complex shapes\n• BIM/CAD integration (IFC, DWG, Revit)\n• GPU-accelerated real-time rendering\n\n**Lighting Design:**\n• PPFD and DLI calculations with real fixture data\n• 5000+ DLC-certified fixtures database\n• Custom spectrum optimization\n• Coverage analysis and uniformity mapping\n• False color PPFD visualization",
    tags: ["3d design", "modeling", "lighting", "PPFD"],
    popularity: 91,
    helpful: 134,
    notHelpful: 9,
    lastUpdated: "2024-01-14",
    relatedQuestions: ["calculators-1", "design-2"],
    isNew: false
  },
  {
    id: "calculators-1",
    category: "Calculators",
    question: "What calculators are available in VibeLux?",
    answer: "VibeLux includes over 50 specialized calculators:\n\n**Lighting Calculators:**\n• PPFD and DLI Calculator\n• Coverage Area Calculator\n• Light Requirements Calculator\n• Spectrum Optimization Calculator\n• Photoperiod Calculator\n\n**Environmental Calculators:**\n• VPD (Vapor Pressure Deficit) Calculator\n• Psychrometric Calculator\n• Heat Load Calculator\n• CO₂ Enrichment Calculator\n• Transpiration Calculator\n\n**Business Calculators:**\n• ROI Calculator\n• TCO (Total Cost of Ownership) Calculator\n• Energy Cost Calculator\n• Payback Analysis Calculator\n• Utility Rebate Calculator",
    tags: ["calculators", "tools", "PPFD", "ROI", "VPD"],
    popularity: 93,
    helpful: 187,
    notHelpful: 11,
    lastUpdated: "2024-01-13",
    relatedQuestions: ["design-1", "calculators-2"],
    isNew: false
  },
  {
    id: 'energy-1',
    category: 'Business & Pricing',
    question: 'How does the Energy Savings Program work and how are savings verified?',
    answer: 'Connect a utility account or upload monthly PDFs. We normalize usage for weather and seasonality and compare expected vs actual for that period. If part of your facility changed (e.g., HPS→LED retrofit not yet reflected in bills), you can add an operational adjustment with dates. Savings are verified per billing period; demand (kW) and energy (kWh) are handled separately.',
    tags: ['energy', 'verification', 'seasonality', 'billing'],
    popularity: 92,
    helpful: 168,
    notHelpful: 7,
    lastUpdated: '2025-08-12',
    relatedQuestions: ['energy-2']
  },
  {
    id: 'energy-2',
    category: 'Business & Pricing',
    question: 'Do you support TOU/seasonal rates and winter vs summer baselines?',
    answer: 'Yes. We build seasonal baselines by month-of-year, factor TOU periods when available, and apply weather normalization. We compare January vs January, July vs July, etc., for fair apples-to-apples savings. When data is sparse, we fall back to normalized IoT estimates with lower confidence until more periods accumulate.',
    tags: ['TOU', 'seasonality', 'baseline'],
    popularity: 88,
    helpful: 121,
    notHelpful: 6,
    lastUpdated: '2025-08-12',
    relatedQuestions: ['energy-1']
  },
  {
    id: 'pricing-1',
    category: 'Business & Pricing',
    question: 'Is there a free trial? What does it include?',
    answer: 'All paid plans include a 14‑day free trial (credit card required). During the trial you can use the Design Studio, Calculator Suite, and core features included in your selected plan. You can cancel any time before the trial ends to avoid charges.',
    tags: ['trial', 'billing', 'plans'],
    popularity: 90,
    helpful: 140,
    notHelpful: 10,
    lastUpdated: '2025-08-12',
    relatedQuestions: ['pricing-2']
  },
  {
    id: 'pricing-2',
    category: 'Business & Pricing',
    question: 'Can I buy the Calculator Suite without a full plan?',
    answer: 'Yes. Calculator Suite is available in all paid plans, and we also support a la carte purchase. If you prefer module‑only access, choose Calculator Suite at checkout and your account will be provisioned without upgrading your main plan.',
    tags: ['calculators', 'plans', 'a la carte'],
    popularity: 85,
    helpful: 99,
    notHelpful: 8,
    lastUpdated: '2025-08-12',
    relatedQuestions: ['calculators-1']
  },
  {
    id: 'design-2',
    category: 'Design Studio',
    question: 'What formats can I import/export (CAD/BIM/PDF/Excel/DXF)?',
    answer: 'You can import CAD/BIM (IFC, DWG, selected Revit via IFC), and export PDF reports, Excel schedules, and DXF drawings. Professional/Enterprise include advanced export options and higher monthly limits.',
    tags: ['CAD', 'BIM', 'DWG', 'DXF', 'PDF', 'Excel'],
    popularity: 87,
    helpful: 120,
    notHelpful: 9,
    lastUpdated: '2025-08-12',
    relatedQuestions: ['design-1']
  },
  {
    id: 'calculators-2',
    category: 'Calculators',
    question: 'Are your calculators research‑grade and how are they validated?',
    answer: 'Yes. Calculators use industry‑standard formulae and research references (PPFD/DLI, VPD, psychrometrics, heat load, CO₂ enrichment, ROI/TCO). Values are validated against known references and unit tests. We continuously improve models and add crop/fixture updates.',
    tags: ['validation', 'research', 'accuracy'],
    popularity: 83,
    helpful: 111,
    notHelpful: 12,
    lastUpdated: '2025-08-12',
    relatedQuestions: ['calculators-1']
  },
  {
    id: 'automation-1',
    category: 'Automation & AI',
    question: 'What can the AI Design Assistant do?',
    answer: 'It can create rooms, place fixtures/benches, set PPFD targets, propose equipment (HVAC/CO₂/irrigation), and generate optimization suggestions. Actions are applied to your model with undo/notifications so you stay in control.',
    tags: ['AI', 'design assistant', 'automation'],
    popularity: 86,
    helpful: 118,
    notHelpful: 13,
    lastUpdated: '2025-08-12',
    relatedQuestions: []
  },
  {
    id: 'monitoring-1',
    category: 'Monitoring',
    question: 'Do I need new sensors or will VibeLux work with my existing system?',
    answer: 'VibeLux works with common controllers and protocols. If you already have sensors, we can integrate your data. If not, we recommend budget‑friendly options that pay for themselves quickly via energy savings and automation.',
    tags: ['sensors', 'integration', 'monitoring'],
    popularity: 84,
    helpful: 101,
    notHelpful: 9,
    lastUpdated: '2025-08-12',
    relatedQuestions: []
  },
  {
    id: 'research-1',
    category: 'Technical',
    question: 'How do trials and research features work (ANOVA, comparison, licensing)?',
    answer: 'Use the Trial Designer to randomize zones/treatments. Log observations/covariates via API/CSV. Analyze results with one‑way ANOVA and Tukey comparisons. Publish a license listing on the marketplace and sell access via Stripe.',
    tags: ['trials', 'anova', 'licensing', 'marketplace'],
    popularity: 82,
    helpful: 96,
    notHelpful: 10,
    lastUpdated: '2025-08-12',
    relatedQuestions: []
  },
  {
    id: 'security-1',
    category: 'Technical',
    question: 'How is authentication handled and are my documents/utility bills secure?',
    answer: 'We use Clerk for auth and role‑based protection on APIs/pages. Uploaded documents and utility PDFs are processed server‑side and stored securely with access controls. Webhooks are verified; keys are stored in encrypted environment variables.',
    tags: ['security', 'auth', 'clerk', 'privacy'],
    popularity: 89,
    helpful: 130,
    notHelpful: 8,
    lastUpdated: '2025-08-12',
    relatedQuestions: []
  },
  {
    id: 'billing-1',
    category: 'Business & Pricing',
    question: 'How does billing work for subscriptions and energy revenue share?',
    answer: 'Subscriptions are billed via Stripe after your 14‑day trial. Energy revenue share is billed monthly based on verified savings; you can review period details and adjustments before payment is captured.',
    tags: ['billing', 'stripe', 'revenue share'],
    popularity: 81,
    helpful: 92,
    notHelpful: 7,
    lastUpdated: '2025-08-12',
    relatedQuestions: ['energy-1']
  },
  {
    id: 'exports-1',
    category: 'Technical',
    question: 'What kinds of reports can I export?',
    answer: 'PDF design summaries, Excel schedules, DXF drawings, and programmatic JSON exports. Electrical reports include circuit/panel schedules and one‑line diagrams. More formats are available on Professional/Enterprise.',
    tags: ['reports', 'exports', 'pdf', 'dxf', 'excel'],
    popularity: 80,
    helpful: 90,
    notHelpful: 8,
    lastUpdated: '2025-08-12',
    relatedQuestions: ['design-2']
  },
  {
    id: 'support-1',
    category: 'Support',
    question: 'What support do I get with my plan?',
    answer: 'Email support is included on all plans. Professional includes priority support; Enterprise includes dedicated success and SLA. We also offer onboarding, training, and paid implementation support on request.',
    tags: ['support', 'sla', 'onboarding'],
    popularity: 78,
    helpful: 85,
    notHelpful: 7,
    lastUpdated: '2025-08-12',
    relatedQuestions: []
  }
  ,
  {
    id: 'marketplace-buyer-1',
    category: 'Business & Pricing',
    question: 'How do My Licenses and entitlements work after I purchase a trial license?',
    answer: 'After checkout, our Stripe webhook confirms payment and automatically creates a Trial License Entitlement for your account. This grants access to the licensed trial assets and protected endpoints. You can view all of your active licenses on the My Licenses page. If a listing is exclusive, it is marked sold on completion and no longer available to others.\n\nWhere to go next:\n• My Licenses: /marketplace/my-licenses\n• Browse Licenses: /marketplace/trial-licenses\n\nAccess rules:\n• Your entitlement is tied to your account; sharing is prohibited\n• If your access needs change (e.g., site transfer), contact support to review the license terms\n• If payment fails, the entitlement is not issued',
    tags: ['marketplace', 'licenses', 'entitlements', 'stripe'],
    popularity: 82,
    helpful: 104,
    notHelpful: 6,
    lastUpdated: '2025-08-12',
    relatedQuestions: ['research-1']
  },
  {
    id: 'marketplace-seller-1',
    category: 'Business & Pricing',
    question: 'How do I create a Seller listing and manage purchases?',
    answer: 'From a completed or active trial, click “Create License Listing” to publish a marketplace listing. Set title, rights (personal/commercial/research-only), price, currency, territory, and whether it is exclusive. Buyers complete payment via Stripe; purchases appear in your Seller overview.\n\nWhere to go next:\n• Create from Trial: open a trial and use “Create License Listing”\n• Seller Overview: /marketplace/seller\n\nBest practices:\n• Provide a clear summary of what the license grants (parameters/SOPs/data)\n• Choose exclusive only when you intend single-license sale\n• Keep your trial documentation up to date to reduce support friction',
    tags: ['marketplace', 'seller', 'listings', 'purchases'],
    popularity: 79,
    helpful: 99,
    notHelpful: 5,
    lastUpdated: '2025-08-12',
    relatedQuestions: ['marketplace-buyer-1']
  }
];

export function EnhancedFAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'popularity' | 'recent' | 'helpful'>('popularity');
  const [showFilters, setShowFilters] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, 'helpful' | 'not-helpful'>>({});

  const { announceToScreenReader } = useAccessibility();
  const { addNotification } = useNotifications();
  const searchOperation = useAsyncOperation();

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    mockFAQs.forEach(faq => faq.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, []);

  // Filter and search FAQs
  const filteredFAQs = useMemo(() => {
    let filtered = mockFAQs;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => 
        faq.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(faq =>
        selectedTags.some(tag => faq.tags.includes(tag))
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'helpful':
          return (b.helpful - b.notHelpful) - (a.helpful - a.notHelpful);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedTags, sortBy]);

  // Update category counts
  const categoriesWithCounts = useMemo(() => {
    return faqCategories.map(category => ({
      ...category,
      count: category.id === 'all' 
        ? mockFAQs.length 
        : mockFAQs.filter(faq => 
            faq.category.toLowerCase().replace(/\s+/g, '-') === category.id
          ).length
    }));
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+f': () => document.getElementById('faq-search')?.focus(),
    'meta+f': () => document.getElementById('faq-search')?.focus(),
  });

  // Toggle FAQ item
  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        announceToScreenReader('FAQ collapsed');
      } else {
        newSet.add(id);
        announceToScreenReader('FAQ expanded');
      }
      return newSet;
    });
  };

  // Handle voting
  const handleVote = async (faqId: string, voteType: 'helpful' | 'not-helpful') => {
    await searchOperation.execute(
      async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setUserVotes(prev => ({ ...prev, [faqId]: voteType }));
        
        addNotification({
          type: 'success',
          title: 'Feedback submitted',
          message: 'Thank you for your feedback!'
        });
      },
      {
        errorMessage: 'Failed to submit feedback'
      }
    );
  };

  // Toggle tag filter
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <ProtectedDocumentViewer
      documentId="enhanced-faq"
      documentTitle="VibeLux FAQ Documentation"
      accessLevel="authenticated"
      showWatermark={true}
      allowDownload={false}
      allowPrint={true}
    >
      <NavigationLayout>
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-400">
            Find answers to common questions about VibeLux features and functionality
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <input
              id="faq-search"
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
              aria-label="Search frequently asked questions"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              aria-expanded={showFilters}
              aria-label="Toggle filters"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(selectedTags.length > 0 || selectedCategory !== 'all') && (
                <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                  {selectedTags.length + (selectedCategory !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              aria-label="Sort FAQs by"
            >
              <option value="popularity">Most Popular</option>
              <option value="recent">Recently Updated</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {categoriesWithCounts.map(category => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center gap-2 p-3 rounded-lg text-left transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                        aria-pressed={selectedCategory === category.id}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{category.name}</div>
                          <div className="text-sm opacity-75">({category.count})</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                      aria-pressed={selectedTags.includes(tag)}
                    >
                      <Tag className="w-3 h-3 inline mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-400">
          {searchQuery && (
            <p>
              {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
          )}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full p-6 text-left hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-inset"
                  aria-expanded={expandedItems.has(faq.id)}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {faq.question}
                        </h3>
                        {faq.isNew && (
                          <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
                            NEW
                          </span>
                        )}
                        {faq.isPremium && (
                          <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                            PRO
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {faq.popularity}% helpful
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Updated {new Date(faq.lastUpdated).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded">
                          {faq.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {expandedItems.has(faq.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {expandedItems.has(faq.id) && (
                  <div 
                    id={`faq-answer-${faq.id}`}
                    className="px-6 pb-6"
                    role="region"
                    aria-labelledby={`faq-question-${faq.id}`}
                  >
                    <div className="prose prose-invert max-w-none">
                      <div className="whitespace-pre-line text-gray-300">
                        {faq.answer}
                      </div>
                    </div>

                    {/* Tags */}
                    {faq.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {faq.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">Was this helpful?</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVote(faq.id, 'helpful')}
                            disabled={searchOperation.loading}
                            className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                              userVotes[faq.id] === 'helpful'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            }`}
                            aria-label="Mark as helpful"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span className="text-sm">{faq.helpful}</span>
                          </button>
                          <button
                            onClick={() => handleVote(faq.id, 'not-helpful')}
                            disabled={searchOperation.loading}
                            className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                              userVotes[faq.id] === 'not-helpful'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            }`}
                            aria-label="Mark as not helpful"
                          >
                            <ThumbsDown className="w-3 h-3" />
                            <span className="text-sm">{faq.notHelpful}</span>
                          </button>
                        </div>
                      </div>

                      {faq.relatedQuestions.length > 0 && (
                        <button className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors">
                          <span>Related questions</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
              <p className="text-gray-400 mb-4">
                {searchQuery 
                  ? `No FAQs match "${searchQuery}". Try different keywords or browse categories.`
                  : 'No FAQs match your current filters. Try adjusting your filters.'
                }
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedTags([]);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="mt-12 p-6 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-start gap-4">
            <MessageCircle className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Still need help?
              </h3>
              <p className="text-gray-400 mb-4">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                  Contact Support
                </button>
                <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                  Book a Demo
                </button>
                <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                  Community Forum
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </NavigationLayout>
    </ProtectedDocumentViewer>
  );
}