'use client';

import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/client-logger';
import {
  Users,
  MessageSquare,
  Phone,
  Video,
  Mail,
  Send,
  Bell,
  Settings,
  User,
  Shield,
  Crown,
  Building,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Search,
  MoreVertical,
  Download,
  Upload,
  FileText,
  Image,
  Paperclip,
  Star,
  Archive,
  Flag,
  MessageCircle,
  UserPlus,
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Lightbulb,
  CheckSquare,
  AlertCircle,
  Info,
  RefreshCw
} from 'lucide-react';

import type { Project } from '@/lib/project-management/project-types';
import {
  ClientPortalEngine,
  type ClientPortalUser,
  type ClientMessage,
  type ClientMeeting,
  type ChangeRequest,
  type MessageType,
  type MessagePriority
} from '@/lib/client-portal/client-portal-engine';

interface StakeholderCommunicationHubProps {
  project: Project;
  currentUser: ClientPortalUser;
  onUpdateCommunication?: (data: any) => void;
}

export function StakeholderCommunicationHub({
  project,
  currentUser,
  onUpdateCommunication
}: StakeholderCommunicationHubProps) {
  const [activeView, setActiveView] = useState<'overview' | 'stakeholders' | 'communications' | 'meetings' | 'notifications'>('overview');
  const [stakeholders, setStakeholders] = useState<ClientPortalUser[]>([]);
  const [communications, setCommunications] = useState<ClientMessage[]>([]);
  const [meetings, setMeetings] = useState<ClientMeeting[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStakeholders, setSelectedStakeholders] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('general');
  const [messagePriority, setMessagePriority] = useState<MessagePriority>('normal');
  const [showNewStakeholder, setShowNewStakeholder] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const portalEngine = new ClientPortalEngine();

  useEffect(() => {
    loadCommunicationData();
  }, [project.id]);

  const loadCommunicationData = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would load stakeholder data
      const sampleStakeholders: ClientPortalUser[] = [
        {
          id: 'stakeholder-1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          company: 'ABC Manufacturing',
          role: 'client',
          permissions: {
            canViewProject: true,
            canViewFinancials: true,
            canViewSchedule: true,
            canViewDocuments: true,
            canDownloadFiles: true,
            canSubmitFeedback: true,
            canRequestChanges: true,
            canApproveDeliverables: true,
            canViewSensitiveData: false,
            canInviteOthers: false
          },
          preferences: {
            notifications: { email: true, sms: false, push: true, frequency: 'daily' },
            dashboard: { defaultView: 'overview', showAdvancedMetrics: false, timezone: 'America/New_York' },
            communication: { language: 'en', preferredChannel: 'email', availableHours: { start: '09:00', end: '17:00', timezone: 'America/New_York' } }
          },
          lastLogin: new Date(),
          isActive: true,
          projects: [project.id],
          contactInfo: {
            phone: '+1-555-123-4567',
            address: { street: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA' }
          }
        },
        {
          id: 'stakeholder-2',
          name: 'Mike Chen',
          email: 'mike.chen@contractor.com',
          company: 'Elite Construction',
          role: 'contractor',
          permissions: {
            canViewProject: true,
            canViewFinancials: false,
            canViewSchedule: true,
            canViewDocuments: true,
            canDownloadFiles: true,
            canSubmitFeedback: true,
            canRequestChanges: true,
            canApproveDeliverables: false,
            canViewSensitiveData: false,
            canInviteOthers: false
          },
          preferences: {
            notifications: { email: true, sms: true, push: false, frequency: 'immediate' },
            dashboard: { defaultView: 'schedule', showAdvancedMetrics: true, timezone: 'America/New_York' },
            communication: { language: 'en', preferredChannel: 'phone', availableHours: { start: '07:00', end: '18:00', timezone: 'America/New_York' } }
          },
          lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isActive: true,
          projects: [project.id],
          contactInfo: {
            phone: '+1-555-987-6543',
            address: { street: '456 Oak Ave', city: 'Boston', state: 'MA', zipCode: '02101', country: 'USA' }
          }
        }
      ];

      setStakeholders(sampleStakeholders);
      setCommunications([]);
      setMeetings([]);
      setNotifications([]);
    } catch (error) {
      logger.error('system', 'Failed to load communication data:', error );
    } finally {
      setIsLoading(false);
    }
  };

  const broadcastMessage = async () => {
    if (!newMessage.trim() || !messageSubject.trim() || selectedStakeholders.length === 0) return;

    try {
      const message = await portalEngine.sendMessage(
        currentUser.id,
        selectedStakeholders,
        project.id,
        messageSubject,
        newMessage,
        messageType,
        messagePriority
      );

      setCommunications(prev => [...prev, message]);
      setNewMessage('');
      setMessageSubject('');
      setSelectedStakeholders([]);
      setShowBroadcast(false);
      
      if (onUpdateCommunication) {
        onUpdateCommunication({ type: 'message_sent', data: message });
      }
    } catch (error) {
      logger.error('system', 'Failed to broadcast message:', error );
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'client':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'contractor':
        return <Building className="w-4 h-4 text-blue-600" />;
      case 'stakeholder':
        return <Users className="w-4 h-4 text-green-600" />;
      case 'consultant':
        return <Shield className="w-4 h-4 text-purple-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string): string => {
    const colors = {
      'client': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'contractor': 'bg-blue-100 text-blue-800 border-blue-200',
      'stakeholder': 'bg-green-100 text-green-800 border-green-200',
      'consultant': 'bg-purple-100 text-purple-800 border-purple-200',
      'observer': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[role as keyof typeof colors] || colors.observer;
  };

  const getActivityIcon = (activity: string) => {
    switch (activity) {
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'meeting':
        return <Calendar className="w-4 h-4 text-green-500" />;
      case 'document':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'change':
        return <Edit className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredStakeholders = stakeholders.filter(stakeholder => {
    const matchesRole = filterRole === 'all' || stakeholder.role === filterRole;
    const matchesSearch = stakeholder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stakeholder.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stakeholder.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="w-6 h-6 mr-2 text-blue-600" />
              Stakeholder Communication Hub
            </h2>
            <p className="text-gray-600 mt-1">
              Manage communication and collaboration with all project stakeholders
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowBroadcast(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Broadcast Message
            </button>
            
            <button
              onClick={() => setShowNewStakeholder(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Stakeholder
            </button>
            
            <button
              onClick={loadCommunicationData}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* View Navigation */}
        <div className="flex space-x-1 mt-4">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'stakeholders', name: 'Stakeholders', icon: Users },
            { id: 'communications', name: 'Communications', icon: MessageSquare },
            { id: 'meetings', name: 'Meetings', icon: Calendar },
            { id: 'notifications', name: 'Notifications', icon: Bell }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={`px-4 py-2 rounded-lg flex items-center font-medium transition-colors ${
                activeView === view.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <view.icon className="w-4 h-4 mr-2" />
              {view.name}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      {activeView === 'overview' && (
        <div className="p-6">
          {/* Communication Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium">Total Stakeholders</p>
                  <p className="text-2xl font-bold text-blue-900">{stakeholders.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-blue-600 text-sm mt-2">
                {stakeholders.filter(s => s.isActive).length} active
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium">Messages Sent</p>
                  <p className="text-2xl font-bold text-green-900">{communications.length}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-green-600 text-sm mt-2">
                This month
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-700 text-sm font-medium">Meetings Scheduled</p>
                  <p className="text-2xl font-bold text-purple-900">{meetings.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-purple-600 text-sm mt-2">
                This week
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-700 text-sm font-medium">Response Rate</p>
                  <p className="text-2xl font-bold text-orange-900">87%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-orange-600 text-sm mt-2">
                Average response time
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Communication Activity</h3>
            <div className="space-y-3">
              {[
                { id: 1, type: 'message', user: 'Sarah Johnson', action: 'sent a message about equipment delivery', time: '2 hours ago' },
                { id: 2, type: 'meeting', user: 'Mike Chen', action: 'scheduled a progress review meeting', time: '4 hours ago' },
                { id: 3, type: 'document', user: 'You', action: 'shared updated project timeline', time: '1 day ago' },
                { id: 4, type: 'change', user: 'Sarah Johnson', action: 'submitted a change request', time: '2 days ago' }
              ].map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                  <div className="p-2 bg-gray-100 rounded-full">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stakeholders View */}
      {activeView === 'stakeholders' && (
        <div className="p-6">
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="client">Client</option>
                <option value="contractor">Contractor</option>
                <option value="stakeholder">Stakeholder</option>
                <option value="consultant">Consultant</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search stakeholders..."
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Stakeholders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStakeholders.map((stakeholder) => (
              <div key={stakeholder.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-lg">
                        {stakeholder.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{stakeholder.name}</h3>
                      <p className="text-sm text-gray-600">{stakeholder.company}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(stakeholder.role)}`}>
                      {stakeholder.role.charAt(0).toUpperCase() + stakeholder.role.slice(1)}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      stakeholder.isActive && stakeholder.lastLogin > new Date(Date.now() - 24 * 60 * 60 * 1000)
                        ? 'bg-green-500'
                        : 'bg-gray-400'
                    }`} />
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{stakeholder.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{stakeholder.contactInfo.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Last active: {stakeholder.lastLogin.toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(stakeholder.role)}
                    <span className="text-sm text-gray-500 capitalize">{stakeholder.role}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedStakeholders([stakeholder.id])}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Send message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Schedule meeting"
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"
                      title="More options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other views would be implemented similarly */}
      {activeView === 'communications' && (
        <div className="p-6">
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Communication History</h3>
            <p className="text-gray-600">
              View and manage all project communications here.
            </p>
          </div>
        </div>
      )}

      {/* Broadcast Message Modal */}
      {showBroadcast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Broadcast Message</h3>
              <button
                onClick={() => setShowBroadcast(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {stakeholders.map((stakeholder) => (
                    <label key={stakeholder.id} className="flex items-center space-x-3 py-1">
                      <input
                        type="checkbox"
                        checked={selectedStakeholders.includes(stakeholder.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStakeholders([...selectedStakeholders, stakeholder.id]);
                          } else {
                            setSelectedStakeholders(selectedStakeholders.filter(id => id !== stakeholder.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900">{stakeholder.name} ({stakeholder.role})</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
                  <select
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value as MessageType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="update">Update</option>
                    <option value="alert">Alert</option>
                    <option value="feedback">Feedback Request</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={messagePriority}
                    onChange={(e) => setMessagePriority(e.target.value as MessagePriority)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="Enter message subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowBroadcast(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={broadcastMessage}
                  disabled={!newMessage.trim() || !messageSubject.trim() || selectedStakeholders.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}