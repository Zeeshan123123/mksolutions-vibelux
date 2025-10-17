'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import {
  Users,
  MessageSquare,
  FileText,
  Calendar,
  Settings,
  Bell,
  BellOff,
  Download,
  Upload,
  Eye,
  Edit,
  Send,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Calendar as CalendarIcon,
  Building,
  User,
  Shield,
  FileCheck,
  MessageCircle,
  Video,
  Paperclip,
  Star,
  Filter,
  Search,
  MoreVertical,
  Plus,
  Minus,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Activity,
  Target,
  Zap
} from 'lucide-react';

import type { Project } from '@/lib/project-management/project-types';
import {
  ClientPortalEngine,
  type ClientPortalUser,
  type ClientMessage,
  type ClientDocument,
  type ChangeRequest,
  type ClientMeeting,
  type ClientReport,
  type MessageType,
  type MessagePriority
} from '@/lib/client-portal/client-portal-engine';

interface ClientPortalPanelProps {
  project: Project;
  currentUser: ClientPortalUser;
  onUserUpdate?: (user: ClientPortalUser) => void;
  onMessageSent?: (message: ClientMessage) => void;
  onChangeRequest?: (change: ChangeRequest) => void;
}

export function ClientPortalPanel({
  project,
  currentUser,
  onUserUpdate,
  onMessageSent,
  onChangeRequest
}: ClientPortalPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'messages' | 'documents' | 'meetings' | 'changes' | 'reports'>('dashboard');
  const [dashboard, setDashboard] = useState<any>(null);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [meetings, setMeetings] = useState<ClientMeeting[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [reports, setReports] = useState<ClientReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('general');
  const [messagePriority, setMessagePriority] = useState<MessagePriority>('normal');
  const [showNewChangeRequest, setShowNewChangeRequest] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const portalEngine = new ClientPortalEngine();

  useEffect(() => {
    loadPortalData();
  }, [project.id, currentUser.id]);

  const loadPortalData = async () => {
    setIsLoading(true);
    try {
      // Load dashboard data
      const dashboardData = await portalEngine.getClientDashboard(currentUser.id, project.id);
      setDashboard(dashboardData);

      // Load messages
      const clientMessages = portalEngine.getClientMessages(currentUser.id);
      setMessages(clientMessages);
      setUnreadCount(clientMessages.filter(msg => !msg.readBy.some(read => read.userId === currentUser.id)).length);

      // Load documents
      const projectDocuments = portalEngine.getProjectDocuments(project.id, currentUser.id);
      setDocuments(projectDocuments);

      // Load meetings
      const projectMeetings = portalEngine.getProjectMeetings(project.id);
      setMeetings(projectMeetings);

      // Load change requests
      const projectChanges = portalEngine.getProjectChangeRequests(project.id);
      setChangeRequests(projectChanges);

      // Load reports (placeholder)
      setReports([]);
    } catch (error) {
      logger.error('system', 'Failed to load portal data:', error );
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !messageSubject.trim()) return;

    try {
      const message = await portalEngine.sendMessage(
        currentUser.id,
        ['project-manager-1'], // In real implementation, this would be dynamic
        project.id,
        messageSubject,
        newMessage,
        messageType,
        messagePriority
      );

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setMessageSubject('');
      
      if (onMessageSent) {
        onMessageSent(message);
      }
    } catch (error) {
      logger.error('system', 'Failed to send message:', error );
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string): string => {
    const colors = {
      'completed': 'text-green-600',
      'in_progress': 'text-blue-600',
      'on_track': 'text-green-600',
      'at_risk': 'text-yellow-600',
      'delayed': 'text-red-600',
      'approved': 'text-green-600',
      'pending': 'text-yellow-600',
      'rejected': 'text-red-600'
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'at_risk':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'delayed':
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string): string => {
    const colors = {
      'low': 'bg-gray-100 text-gray-800 border-gray-200',
      'normal': 'bg-blue-100 text-blue-800 border-blue-200',
      'high': 'bg-orange-100 text-orange-800 border-orange-200',
      'urgent': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading client portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Building className="w-6 h-6 mr-2 text-blue-600" />
              Client Portal
            </h2>
            <p className="text-gray-600 mt-1">
              Welcome back, {currentUser.name} from {currentUser.company}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Online</span>
              </div>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                Last login: {currentUser.lastLogin.toLocaleDateString()}
              </span>
            </div>
            
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-4">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
            { id: 'messages', name: 'Messages', icon: MessageSquare, badge: unreadCount },
            { id: 'documents', name: 'Documents', icon: FileText },
            { id: 'meetings', name: 'Meetings', icon: Calendar },
            { id: 'changes', name: 'Changes', icon: Edit },
            { id: 'reports', name: 'Reports', icon: FileCheck }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg flex items-center font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && dashboard && (
        <div className="p-6">
          {/* Project Overview */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{dashboard.projectOverview.name}</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(dashboard.projectOverview.status.toLowerCase())}
                      <span className={`font-medium ${getStatusColor(dashboard.projectOverview.status.toLowerCase())}`}>
                        {dashboard.projectOverview.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-700 font-medium">{dashboard.projectOverview.progress}% Complete</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-600">Next Milestone</p>
                  <p className="font-semibold text-gray-900">{dashboard.projectOverview.nextMilestone}</p>
                  <p className="text-sm text-blue-600">{dashboard.projectOverview.nextMilestoneDate.toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${dashboard.projectOverview.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium">Budget Status</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(dashboard.budgetSummary.remaining)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-green-600 text-sm mt-2">
                {((dashboard.budgetSummary.remaining / dashboard.budgetSummary.totalBudget) * 100).toFixed(1)}% remaining
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium">Schedule Health</p>
                  <p className="text-2xl font-bold text-blue-900 capitalize">
                    {dashboard.scheduleHealth.status.replace('_', ' ')}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-blue-600 text-sm mt-2">
                {dashboard.scheduleHealth.daysAhead} days ahead
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-700 text-sm font-medium">Upcoming Meetings</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {dashboard.upcomingMeetings.length}
                  </p>
                </div>
                <CalendarIcon className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-purple-600 text-sm mt-2">
                This week
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-700 text-sm font-medium">Pending Items</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {dashboard.pendingApprovals.length}
                  </p>
                </div>
                <FileCheck className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-orange-600 text-sm mt-2">
                Awaiting approval
              </p>
            </div>
          </div>

          {/* Recent Updates */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Updates</h3>
              <div className="space-y-4">
                {dashboard.recentUpdates.map((update: any) => (
                  <div key={update.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                    <div className={`p-2 rounded-full ${
                      update.type === 'milestone' ? 'bg-green-100' :
                      update.type === 'approval' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {update.type === 'milestone' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : update.type === 'approval' ? (
                        <FileCheck className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Activity className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{update.title}</h4>
                      <p className="text-sm text-gray-600">{update.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{update.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Meetings */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Meetings</h3>
              <div className="space-y-4">
                {dashboard.upcomingMeetings.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No upcoming meetings</p>
                ) : (
                  dashboard.upcomingMeetings.map((meeting: any) => (
                    <div key={meeting.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <CalendarIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                        <p className="text-sm text-gray-600">{meeting.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{meeting.scheduledAt.toLocaleDateString()}</span>
                          <span>{meeting.scheduledAt.toLocaleTimeString()}</span>
                          <span>{meeting.duration} min</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </button>
          </div>
          
          {/* New Message Form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder="Subject"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex space-x-2">
                <select
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value as MessageType)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="change_request">Change Request</option>
                  <option value="feedback">Feedback</option>
                  <option value="approval">Approval</option>
                </select>
                <select
                  value={messagePriority}
                  onChange={(e) => setMessagePriority(e.target.value as MessagePriority)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex items-center justify-between mt-4">
              <button className="text-gray-400 hover:text-gray-600">
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !messageSubject.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{message.subject}</h4>
                      <p className="text-sm text-gray-600">
                        From: {message.fromUserId === currentUser.id ? 'You' : 'Project Team'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(message.priority)}`}>
                        {message.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {message.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{message.content}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <button className="text-blue-600 hover:text-blue-700 flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Reply
                    </button>
                    <button className="text-gray-500 hover:text-gray-700 flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Star
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Other tabs would be implemented similarly */}
      {activeTab === 'documents' && (
        <div className="p-6">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Document Library</h3>
            <p className="text-gray-600">
              Access project documents, drawings, and specifications here.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'meetings' && (
        <div className="p-6">
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Meeting Schedule</h3>
            <p className="text-gray-600">
              View and manage project meetings and appointments.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'changes' && (
        <div className="p-6">
          <div className="text-center py-12">
            <Edit className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Change Management</h3>
            <p className="text-gray-600">
              Submit and track project change requests.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="p-6">
          <div className="text-center py-12">
            <FileCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Project Reports</h3>
            <p className="text-gray-600">
              Access project progress reports and analytics.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}