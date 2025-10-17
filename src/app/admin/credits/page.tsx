'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import { 
  Gift, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Search,
  Filter,
  Plus,
  Send,
  History,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name?: string;
  credits: {
    available: number;
    used: number;
    purchased: number;
    bonus: number;
  };
  subscription: string;
  lastActive: string;
}

interface CreditTransaction {
  id: string;
  userId: string;
  userEmail: string;
  type: 'bonus' | 'purchase' | 'usage' | 'refund' | 'monthly_reset';
  amount: number;
  reason: string;
  adminId: string;
  createdAt: string;
}

interface CreditCampaign {
  id: string;
  name: string;
  description: string;
  credits: number;
  targetUsers: 'all' | 'new' | 'inactive' | 'trial' | 'specific';
  status: 'draft' | 'active' | 'completed';
  sentCount: number;
  totalUsers: number;
  createdAt: string;
}

export default function AdminCreditsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'give-credits' | 'bulk-campaigns' | 'transactions'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [campaigns, setCampaigns] = useState<CreditCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // Give Credits Form
  const [giveCreditsForm, setGiveCreditsForm] = useState({
    userId: '',
    amount: '',
    reason: '',
    type: 'bonus' as 'bonus' | 'refund'
  });

  // Bulk Campaign Form
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    credits: '',
    targetUsers: 'all' as 'all' | 'new' | 'inactive' | 'trial',
    emailSubject: '',
    emailMessage: ''
  });

  const [showGiveCreditsModal, setShowGiveCreditsModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load users, transactions, and campaigns
      // This would be actual API calls in production
      setUsers(generateMockUsers());
      setTransactions(generateMockTransactions());
      setCampaigns(generateMockCampaigns());
    } catch (error) {
      logger.error('system', 'Error loading data:', error );
    } finally {
      setLoading(false);
    }
  };

  const handleGiveCredits = async () => {
    try {
      const response = await fetch('/api/admin/credits/give', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(giveCreditsForm)
      });

      if (response.ok) {
        setShowGiveCreditsModal(false);
        setGiveCreditsForm({ userId: '', amount: '', reason: '', type: 'bonus' });
        loadData(); // Refresh data
      }
    } catch (error) {
      logger.error('system', 'Error giving credits:', error );
    }
  };

  const handleBulkCampaign = async () => {
    try {
      const response = await fetch('/api/admin/credits/bulk-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignForm)
      });

      if (response.ok) {
        setShowCampaignModal(false);
        setCampaignForm({
          name: '',
          description: '',
          credits: '',
          targetUsers: 'all',
          emailSubject: '',
          emailMessage: ''
        });
        loadData();
      }
    } catch (error) {
      logger.error('system', 'Error creating campaign:', error );
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    totalCreditsGiven: transactions
      .filter(t => t.type === 'bonus')
      .reduce((sum, t) => sum + t.amount, 0),
    avgCreditsPerUser: users.length > 0 
      ? users.reduce((sum, u) => sum + u.credits.available, 0) / users.length 
      : 0,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Credit Management</h1>
            <p className="text-gray-400">Give away credits, run campaigns, and track usage</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowGiveCreditsModal(true)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Gift className="w-4 h-4" />
              Give Credits
            </button>
            <button
              onClick={() => setShowCampaignModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Send className="w-4 h-4" />
              Bulk Campaign
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-gray-400">Total Users</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-400">Credits Given</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalCreditsGiven.toLocaleString()}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">Avg Credits/User</span>
            </div>
            <div className="text-2xl font-bold text-white">{Math.round(stats.avgCreditsPerUser)}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span className="text-sm text-gray-400">Active Campaigns</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.activeCampaigns}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-800/30 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'give-credits', label: 'Give Credits', icon: Gift },
            { id: 'bulk-campaigns', label: 'Bulk Campaigns', icon: Send },
            { id: 'transactions', label: 'Transaction History', icon: History }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowGiveCreditsModal(true)}
                  className="p-4 bg-purple-600/20 border border-purple-500/50 rounded-lg hover:bg-purple-600/30 transition-colors text-left"
                >
                  <Gift className="w-6 h-6 text-purple-400 mb-2" />
                  <div className="font-medium text-white">Give Individual Credits</div>
                  <div className="text-sm text-gray-400">Reward specific users with bonus credits</div>
                </button>
                
                <button
                  onClick={() => setShowCampaignModal(true)}
                  className="p-4 bg-blue-600/20 border border-blue-500/50 rounded-lg hover:bg-blue-600/30 transition-colors text-left"
                >
                  <Send className="w-6 h-6 text-blue-400 mb-2" />
                  <div className="font-medium text-white">Launch Campaign</div>
                  <div className="text-sm text-gray-400">Send credits to multiple users at once</div>
                </button>
                
                <button className="p-4 bg-green-600/20 border border-green-500/50 rounded-lg hover:bg-green-600/30 transition-colors text-left">
                  <Target className="w-6 h-6 text-green-400 mb-2" />
                  <div className="font-medium text-white">Target Inactive Users</div>
                  <div className="text-sm text-gray-400">Re-engage users who haven't been active</div>
                </button>
              </div>
            </div>

            {/* Recent Campaigns */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Campaigns</h3>
              <div className="space-y-3">
                {campaigns.slice(0, 5).map(campaign => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div>
                      <div className="font-medium text-white">{campaign.name}</div>
                      <div className="text-sm text-gray-400">{campaign.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white">{campaign.credits} credits</div>
                      <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                        campaign.status === 'active' 
                          ? 'bg-green-600/20 text-green-400'
                          : campaign.status === 'completed'
                          ? 'bg-blue-600/20 text-blue-400'
                          : 'bg-gray-600/20 text-gray-400'
                      }`}>
                        {campaign.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'give-credits' && (
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6">Give Credits to Individual Users</h3>
            
            {/* Search Users */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Users List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-white">{user.name || 'No name'}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-white">{user.credits.available} credits</div>
                      <div className="text-xs text-gray-400">{user.subscription} plan</div>
                    </div>
                    <button
                      onClick={() => {
                        setGiveCreditsForm(prev => ({ ...prev, userId: user.id }));
                        setShowGiveCreditsModal(true);
                      }}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Gift className="w-3 h-3" />
                      Give Credits
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bulk-campaigns' && (
          <div className="space-y-6">
            {/* Active Campaigns */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Campaign Management</h3>
              <div className="space-y-3">
                {campaigns.map(campaign => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-medium text-white">{campaign.name}</div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          campaign.status === 'active' 
                            ? 'bg-green-600/20 text-green-400'
                            : campaign.status === 'completed'
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'bg-gray-600/20 text-gray-400'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mb-2">{campaign.description}</div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{campaign.credits} credits per user</span>
                        <span>{campaign.sentCount}/{campaign.totalUsers} sent</span>
                        <span>Target: {campaign.targetUsers}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-white">
                        <History className="w-4 h-4" />
                      </button>
                      {campaign.status === 'draft' && (
                        <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg">
                          Launch
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6">Credit Transaction History</h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'bonus' 
                        ? 'bg-green-600/20 text-green-400'
                        : transaction.type === 'usage'
                        ? 'bg-red-600/20 text-red-400'
                        : 'bg-blue-600/20 text-blue-400'
                    }`}>
                      {transaction.type === 'bonus' ? '+' : transaction.type === 'usage' ? '-' : '='}
                    </div>
                    <div>
                      <div className="font-medium text-white">{transaction.userEmail}</div>
                      <div className="text-sm text-gray-400">{transaction.reason}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      transaction.type === 'bonus' 
                        ? 'text-green-400'
                        : transaction.type === 'usage'
                        ? 'text-red-400'
                        : 'text-blue-400'
                    }`}>
                      {transaction.type === 'bonus' ? '+' : transaction.type === 'usage' ? '-' : ''}
                      {transaction.amount} credits
                    </div>
                    <div className="text-xs text-gray-500">{transaction.createdAt}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Give Credits Modal */}
        {showGiveCreditsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Give Credits</h3>
                <button
                  onClick={() => setShowGiveCreditsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                  <input
                    type="number"
                    value={giveCreditsForm.amount}
                    onChange={(e) => setGiveCreditsForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Enter credit amount"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reason</label>
                  <input
                    type="text"
                    value={giveCreditsForm.reason}
                    onChange={(e) => setGiveCreditsForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Why are you giving these credits?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                  <select
                    value={giveCreditsForm.type}
                    onChange={(e) => setGiveCreditsForm(prev => ({ ...prev, type: e.target.value as 'bonus' | 'refund' }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="bonus">Bonus Credits</option>
                    <option value="refund">Refund Credits</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowGiveCreditsModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGiveCredits}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Give Credits
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Campaign Modal */}
        {showCampaignModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Create Bulk Credit Campaign</h3>
                <button
                  onClick={() => setShowCampaignModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Name</label>
                    <input
                      type="text"
                      value={campaignForm.name}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      placeholder="e.g. Welcome Bonus"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Credits per User</label>
                    <input
                      type="number"
                      value={campaignForm.credits}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, credits: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      placeholder="100"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <input
                    type="text"
                    value={campaignForm.description}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Brief description of this campaign"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Target Users</label>
                  <select
                    value={campaignForm.targetUsers}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, targetUsers: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="all">All Users</option>
                    <option value="new">New Users (last 30 days)</option>
                    <option value="inactive">Inactive Users (30+ days)</option>
                    <option value="trial">Trial Users</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Subject</label>
                  <input
                    type="text"
                    value={campaignForm.emailSubject}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, emailSubject: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="🎁 You've got free credits!"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Message</label>
                  <textarea
                    value={campaignForm.emailMessage}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, emailMessage: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Write a message to accompany the credit gift..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCampaignModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkCampaign}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Mock data generators
function generateMockUsers(): User[] {
  return [
    {
      id: '1',
      email: 'john@example.com',
      name: 'John Smith',
      credits: { available: 150, used: 50, purchased: 100, bonus: 100 },
      subscription: 'Professional',
      lastActive: '2 hours ago'
    },
    {
      id: '2', 
      email: 'sarah@growhouse.com',
      name: 'Sarah Johnson',
      credits: { available: 75, used: 125, purchased: 200, bonus: 0 },
      subscription: 'Business',
      lastActive: '1 day ago'
    },
    {
      id: '3',
      email: 'mike@cultivation.co',
      name: 'Mike Chen',
      credits: { available: 25, used: 75, purchased: 100, bonus: 0 },
      subscription: 'Starter',
      lastActive: '5 days ago'
    }
  ];
}

function generateMockTransactions(): CreditTransaction[] {
  return [
    {
      id: '1',
      userId: '1',
      userEmail: 'john@example.com',
      type: 'bonus',
      amount: 100,
      reason: 'Welcome bonus for new user',
      adminId: 'admin1',
      createdAt: '2 hours ago'
    },
    {
      id: '2',
      userId: '2',
      userEmail: 'sarah@growhouse.com',
      type: 'usage',
      amount: 25,
      reason: 'AI greenhouse design',
      adminId: 'system',
      createdAt: '1 day ago'
    }
  ];
}

function generateMockCampaigns(): CreditCampaign[] {
  return [
    {
      id: '1',
      name: 'Welcome Bonus',
      description: 'Give new users 100 free credits',
      credits: 100,
      targetUsers: 'new',
      status: 'active',
      sentCount: 45,
      totalUsers: 50,
      createdAt: '3 days ago'
    },
    {
      id: '2',
      name: 'Re-engagement Campaign',
      description: 'Bring back inactive users',
      credits: 50,
      targetUsers: 'inactive',
      status: 'completed',
      sentCount: 120,
      totalUsers: 120,
      createdAt: '1 week ago'
    }
  ];
}