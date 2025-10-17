'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { logger } from '@/lib/client-logger';
import { MarketingNavigation } from '@/components/MarketingNavigation';
import { Footer } from '@/components/Footer';
import {
  Phone, Mail, MessageSquare, FileText, HelpCircle, Zap, Clock, 
  CheckCircle, AlertCircle, Calendar, Users, Video, Book, 
  ChevronRight, Search, Filter, Plus, Send, Paperclip,
  ThumbsUp, ThumbsDown, ExternalLink, Award, Shield
} from 'lucide-react';

// Mock data - in production, this would come from API
const mockTickets = [
  {
    id: 'TICK-001',
    subject: 'Energy optimization not showing savings',
    status: 'open',
    priority: 'high',
    created: '2024-12-15',
    lastUpdate: '2024-12-16',
    assignedTo: 'Sarah Chen',
    category: 'technical'
  },
  {
    id: 'TICK-002', 
    subject: 'Billing question about December invoice',
    status: 'resolved',
    priority: 'medium',
    created: '2024-12-10',
    lastUpdate: '2024-12-12',
    assignedTo: 'Mike Rodriguez',
    category: 'billing'
  },
  {
    id: 'TICK-003',
    subject: 'Setup new facility location',
    status: 'in-progress',
    priority: 'medium',
    created: '2024-12-08',
    lastUpdate: '2024-12-14',
    assignedTo: 'Alex Johnson',
    category: 'setup'
  }
];

const faqCategories = [
  {
    name: 'Energy Optimization',
    icon: Zap,
    questions: [
      {
        q: 'How quickly will I see energy savings?',
        a: 'Most facilities see measurable savings within the first billing cycle (30 days). Our AI system needs 24-48 hours to learn your facility patterns before optimizations begin.'
      },
      {
        q: 'What if I don\'t reach the 15% savings guarantee?',
        a: 'If you don\'t achieve at least 15% energy cost reduction within 90 days, VibeLux provides the service free until the guarantee is met. This is backed by our performance guarantee.'
      },
      {
        q: 'Can I override the system during critical periods?',
        a: 'Yes, you have complete manual override control 24/7. You can disable optimization instantly for any reason, such as harvest periods or equipment maintenance.'
      }
    ]
  },
  {
    name: 'Billing & Payments',
    icon: FileText,
    questions: [
      {
        q: 'How is the 70/30 revenue split calculated?',
        a: 'Your baseline energy usage is established from 12 months of historical utility bills with weather normalization. Monthly savings = (Weather-adjusted baseline - Actual usage) × Utility rate. You keep 70%, VibeLux takes 30%.'
      },
      {
        q: 'When do I get charged?',
        a: 'Payment is automatically deducted from your verified monthly savings within 15 days of receiving your utility bill. If there are no savings, there\'s no charge.'
      },
      {
        q: 'Who verifies the savings calculations?',
        a: 'All savings calculations are verified by independent third-party utility bill analysis to ensure accuracy and transparency.'
      }
    ]
  },
  {
    name: 'Technical Setup',
    icon: Users,
    questions: [
      {
        q: 'What equipment do I need to install?',
        a: 'VibeLux provides all monitoring equipment at no cost. Installation typically takes 2-3 hours and is performed by our certified technicians.'
      },
      {
        q: 'Will this interfere with my existing systems?',
        a: 'No, VibeLux works with your existing control systems and sensors. We integrate non-invasively and maintain all your current operational protocols.'
      },
      {
        q: 'What happens if I want to cancel?',
        a: 'You can cancel anytime with 30 days written notice. No penalties or early termination fees. You keep all installed equipment and receive a final savings calculation.'
      }
    ]
  }
];

export default function SupportPage() {
  const { isSignedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: ''
  });

  const handleSubmitTicket = () => {
    // In production, this would submit to API
    logger.info('system', 'Submitting ticket:', { data: ticketForm });
    setNewTicketOpen(false);
    setTicketForm({ subject: '', category: '', priority: 'medium', description: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-400 bg-red-400/10';
      case 'in-progress': return 'text-yellow-400 bg-yellow-400/10';
      case 'resolved': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <>
      <MarketingNavigation />
      <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Support Center</h1>
          <p className="text-gray-400">Get help with your VibeLux energy optimization system</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => setNewTicketOpen(true)}
            className="bg-gradient-to-r from-green-600 to-purple-600 text-white rounded-xl p-6 hover:shadow-lg transition-all text-left"
          >
            <MessageSquare className="w-8 h-8 mb-3" />
            <h3 className="font-semibold mb-1">Create Ticket</h3>
            <p className="text-sm opacity-90">Get personalized help</p>
          </button>

          <a href="tel:1-800-VIBELUX" className="bg-gray-900 text-white rounded-xl p-6 hover:bg-gray-800 transition-colors text-left border border-gray-800">
            <Phone className="w-8 h-8 mb-3 text-blue-400" />
            <h3 className="font-semibold mb-1">24/7 Emergency</h3>
            <p className="text-sm text-gray-400">1-800-VIBELUX</p>
          </a>

          <button 
            onClick={() => setActiveTab('faq')}
            className="bg-gray-900 text-white rounded-xl p-6 hover:bg-gray-800 transition-colors text-left border border-gray-800"
          >
            <HelpCircle className="w-8 h-8 mb-3 text-purple-400" />
            <h3 className="font-semibold mb-1">FAQ</h3>
            <p className="text-sm text-gray-400">Quick answers</p>
          </button>

          <a href="mailto:blake@vibelux.ai" className="bg-gray-900 text-white rounded-xl p-6 hover:bg-gray-800 transition-colors text-left border border-gray-800">
            <Mail className="w-8 h-8 mb-3 text-green-400" />
            <h3 className="font-semibold mb-1">Email Support</h3>
            <p className="text-sm text-gray-400">blake@vibelux.ai</p>
          </a>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-800 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tickets'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              My Tickets ({mockTickets.length})
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'faq'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              FAQ
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'resources'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              Resources
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Service Status */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Service Status</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="font-medium text-white">Energy Optimization</div>
                      <div className="text-sm text-green-400">Active & Optimizing</div>
                    </div>
                  </div>
                </div>
                <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="font-medium text-white">Monitoring Systems</div>
                      <div className="text-sm text-green-400">All Systems Online</div>
                    </div>
                  </div>
                </div>
                <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="font-medium text-white">Performance Guarantee</div>
                      <div className="text-sm text-green-400">On Track (28% savings)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-white">Monthly Savings Report Generated</div>
                    <div className="text-sm text-gray-400">December savings: $4,725 (28% reduction) • 2 hours ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-white">System Optimization Updated</div>
                    <div className="text-sm text-gray-400">Peak hour schedule optimized for winter rates • 1 day ago</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                  <Award className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-white">Performance Milestone Reached</div>
                    <div className="text-sm text-gray-400">3 consecutive months exceeding 25% savings • 3 days ago</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Team */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Your Support Team</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">SC</span>
                    </div>
                    <div>
                      <div className="font-medium text-white">Sarah Chen</div>
                      <div className="text-sm text-gray-400">Technical Specialist</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">Handles system optimization and technical issues</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">MR</span>
                    </div>
                    <div>
                      <div className="font-medium text-white">Mike Rodriguez</div>
                      <div className="text-sm text-gray-400">Billing Specialist</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">Assists with billing, payments, and savings calculations</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">AJ</span>
                    </div>
                    <div>
                      <div className="font-medium text-white">Alex Johnson</div>
                      <div className="text-sm text-gray-400">Account Manager</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">Manages account setup, onboarding, and strategic guidance</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Support Tickets</h2>
              <button
                onClick={() => setNewTicketOpen(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Ticket
              </button>
            </div>

            <div className="space-y-4">
              {mockTickets.map((ticket) => (
                <div key={ticket.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{ticket.subject}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority} priority
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {ticket.id} • Created {ticket.created} • Last updated {ticket.lastUpdate}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Assigned to {ticket.assignedTo}
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {ticket.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search FAQ..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {faqCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedCategory(index)}
                    className={`px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors ${
                      selectedCategory === index
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              {faqCategories[selectedCategory].questions.map((faq, index) => (
                <div key={index} className="bg-gray-900 rounded-xl border border-gray-800">
                  <details className="group">
                    <summary className="p-6 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white group-open:text-purple-400">
                          {faq.q}
                        </h3>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                      </div>
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="text-gray-300 leading-relaxed">{faq.a}</p>
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-800">
                        <span className="text-sm text-gray-400">Was this helpful?</span>
                        <button className="text-green-400 hover:text-green-300">
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button className="text-red-400 hover:text-red-300">
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a href="/legal/energy-services-agreement" className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-purple-500 transition-colors">
              <Shield className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Service Agreement</h3>
              <p className="text-gray-400 mb-4">Review your energy services agreement terms</p>
              <div className="flex items-center text-purple-400 text-sm">
                View Agreement <ExternalLink className="w-4 h-4 ml-1" />
              </div>
            </a>

            <a href="/billing-dashboard" className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-green-500 transition-colors">
              <FileText className="w-8 h-8 text-green-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Billing Dashboard</h3>
              <p className="text-gray-400 mb-4">View savings reports and billing history</p>
              <div className="flex items-center text-green-400 text-sm">
                View Dashboard <ExternalLink className="w-4 h-4 ml-1" />
              </div>
            </a>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <Video className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Video Tutorials</h3>
              <p className="text-gray-400 mb-4">Learn how to use your energy dashboard</p>
              <div className="flex items-center text-blue-400 text-sm">
                Watch Videos <ExternalLink className="w-4 h-4 ml-1" />
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <Book className="w-8 h-8 text-yellow-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Knowledge Base</h3>
              <p className="text-gray-400 mb-4">Detailed guides and documentation</p>
              <div className="flex items-center text-yellow-400 text-sm">
                Browse Articles <ExternalLink className="w-4 h-4 ml-1" />
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <Calendar className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Schedule Consultation</h3>
              <p className="text-gray-400 mb-4">Book time with your account specialist</p>
              <div className="flex items-center text-purple-400 text-sm">
                Book Meeting <ExternalLink className="w-4 h-4 ml-1" />
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <Phone className="w-8 h-8 text-red-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Emergency Support</h3>
              <p className="text-gray-400 mb-4">24/7 emergency technical support</p>
              <div className="flex items-center text-red-400 text-sm">
                Call 1-800-VIBELUX <ExternalLink className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        )}

        {/* New Ticket Modal */}
        {newTicketOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Create Support Ticket</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                  <input
                    type="text"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Brief description of your issue"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select category</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing Question</option>
                      <option value="setup">Setup/Installation</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Provide detailed information about your issue..."
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setNewTicketOpen(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitTicket}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Ticket
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
      <Footer />
    </>
  );
}