'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Hash, 
  Users, 
  Settings,
  Plus,
  Search,
  MoreVertical,
  MessageSquare,
  Bell,
  BellOff
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

interface Message {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  timestamp: Date;
  channelId: string;
  reactions?: { emoji: string; users: string[]; }[];
  attachments?: { name: string; url: string; type: string; }[];
  replyTo?: string;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'dm';
  members: string[];
  isNotificationEnabled: boolean;
  unreadCount: number;
  lastActivity?: Date;
}

interface TeamChatProps {
  facilityId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TeamChat({ facilityId, isOpen, onClose }: TeamChatProps) {
  const { userId } = useAuth();
  const { user } = useUser();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>('general');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    if (isOpen && facilityId) {
      loadChannels();
      loadMessages(activeChannel);
    }
  }, [isOpen, facilityId, activeChannel]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChannels = async () => {
    try {
      // Mock channels - in production, fetch from API
      const mockChannels: Channel[] = [
        {
          id: 'general',
          name: 'general',
          description: 'General facility discussion',
          type: 'public',
          members: ['user1', 'user2', 'user3'],
          isNotificationEnabled: true,
          unreadCount: 0
        },
        {
          id: 'operations',
          name: 'operations',
          description: 'Daily operations and tasks',
          type: 'public',
          members: ['user1', 'user2'],
          isNotificationEnabled: true,
          unreadCount: 2
        },
        {
          id: 'maintenance',
          name: 'maintenance',
          description: 'Equipment maintenance coordination',
          type: 'public',
          members: ['user1', 'user3'],
          isNotificationEnabled: false,
          unreadCount: 0
        },
        {
          id: 'compliance',
          name: 'compliance',
          description: 'Regulatory and compliance matters',
          type: 'private',
          members: ['user1'],
          isNotificationEnabled: true,
          unreadCount: 1
        }
      ];
      setChannels(mockChannels);
    } catch (error) {
      console.error('Failed to load channels:', error);
    }
  };

  const loadMessages = async (channelId: string) => {
    try {
      setIsLoading(true);
      // Mock messages - in production, fetch from API
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Good morning team! How are the plants looking today?',
          authorId: 'user1',
          authorName: 'Sarah Chen',
          authorAvatar: '/avatars/sarah.jpg',
          timestamp: new Date(Date.now() - 3600000),
          channelId,
          reactions: [
            { emoji: '👍', users: ['user2', 'user3'] },
            { emoji: '🌱', users: ['user1'] }
          ]
        },
        {
          id: '2',
          content: 'Zone 3 looks fantastic! The new LED configuration is really showing results.',
          authorId: 'user2',
          authorName: 'Mike Rodriguez',
          timestamp: new Date(Date.now() - 3000000),
          channelId,
          replyTo: '1'
        },
        {
          id: '3',
          content: 'I noticed some browning on the lower leaves in Zone 1. Should we adjust the nutrient mix?',
          authorId: 'user3',
          authorName: 'Alex Kim',
          timestamp: new Date(Date.now() - 1800000),
          channelId,
          attachments: [
            { name: 'zone1_inspection.jpg', url: '#', type: 'image' }
          ]
        },
        {
          id: '4',
          content: 'Let me check the nutrient data. @alex can you send me the EC readings from this morning?',
          authorId: 'user1',
          authorName: 'Sarah Chen',
          timestamp: new Date(Date.now() - 600000),
          channelId,
          replyTo: '3'
        }
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      authorId: userId,
      authorName: user?.firstName + ' ' + user?.lastName || 'You',
      authorAvatar: user?.imageUrl,
      timestamp: new Date(),
      channelId: activeChannel
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // In production, send to API
    try {
      // await sendMessageToAPI(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (!userId) return;

    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          if (existingReaction.users.includes(userId)) {
            // Remove reaction
            existingReaction.users = existingReaction.users.filter(u => u !== userId);
            if (existingReaction.users.length === 0) {
              return { ...msg, reactions: reactions.filter(r => r.emoji !== emoji) };
            }
          } else {
            // Add reaction
            existingReaction.users.push(userId);
          }
        } else {
          // New reaction
          reactions.push({ emoji, users: [userId] });
        }
        
        return { ...msg, reactions: [...reactions] };
      }
      return msg;
    }));
  };

  const toggleChannelNotifications = (channelId: string) => {
    setChannels(prev => prev.map(channel => 
      channel.id === channelId 
        ? { ...channel, isNotificationEnabled: !channel.isNotificationEnabled }
        : channel
    ));
  };

  const formatMessageTime = (timestamp: Date) => {
    if (isToday(timestamp)) {
      return format(timestamp, 'h:mm a');
    } else if (isYesterday(timestamp)) {
      return 'Yesterday ' + format(timestamp, 'h:mm a');
    } else {
      return format(timestamp, 'MMM d, h:mm a');
    }
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
      <div className="bg-gray-900 w-full max-w-6xl mx-auto my-4 rounded-lg flex overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">Team Chat</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Channels */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Channels</span>
                <Plus className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
              </div>
              <div className="space-y-1">
                {filteredChannels.filter(c => c.type === 'public').map(channel => (
                  <div
                    key={channel.id}
                    onClick={() => setActiveChannel(channel.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer group ${
                      activeChannel === channel.id 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      <span className="text-sm">{channel.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {channel.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {channel.unreadCount}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleChannelNotifications(channel.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {channel.isNotificationEnabled ? (
                          <Bell className="w-3 h-3" />
                        ) : (
                          <BellOff className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Private</span>
                  <Plus className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
                </div>
                <div className="space-y-1">
                  {filteredChannels.filter(c => c.type === 'private').map(channel => (
                    <div
                      key={channel.id}
                      onClick={() => setActiveChannel(channel.id)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer group ${
                        activeChannel === channel.id 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm">{channel.name}</span>
                      </div>
                      {channel.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {channel.unreadCount}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-green-400">● Online</div>
              </div>
              <Settings className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700 bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {channels.find(c => c.id === activeChannel)?.name || activeChannel}
                  </h3>
                  {channels.find(c => c.id === activeChannel)?.description && (
                    <p className="text-sm text-gray-400">
                      {channels.find(c => c.id === activeChannel)?.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <MoreVertical className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="text-center text-gray-400 py-8">Loading messages...</div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="group">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-white">
                        {message.authorName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{message.authorName}</span>
                        <span className="text-xs text-gray-400">
                          {formatMessageTime(message.timestamp)}
                        </span>
                      </div>
                      
                      {message.replyTo && (
                        <div className="text-xs text-gray-400 mb-1">
                          Replying to {messages.find(m => m.id === message.replyTo)?.authorName}
                        </div>
                      )}
                      
                      <div className="text-gray-300 text-sm leading-relaxed">
                        {message.content}
                      </div>

                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-700 rounded text-sm">
                              <Paperclip className="w-4 h-4 text-gray-400" />
                              <span className="text-blue-400 hover:underline cursor-pointer">
                                {attachment.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {message.reactions && message.reactions.length > 0 && (
                        <div className="mt-2 flex gap-1">
                          {message.reactions.map((reaction, index) => (
                            <button
                              key={index}
                              onClick={() => addReaction(message.id, reaction.emoji)}
                              className={`px-2 py-1 rounded-full text-xs border ${
                                reaction.users.includes(userId || '')
                                  ? 'border-blue-500 bg-blue-500 bg-opacity-20 text-blue-400'
                                  : 'border-gray-600 text-gray-400 hover:border-gray-500'
                              }`}
                            >
                              {reaction.emoji} {reaction.users.length}
                            </button>
                          ))}
                          <button
                            onClick={() => addReaction(message.id, '👍')}
                            className="px-2 py-1 rounded-full text-xs border border-gray-600 text-gray-400 hover:border-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Smile className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-700 bg-gray-800">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={`Message #${activeChannel}`}
                  className="w-full p-3 bg-gray-700 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Smile className="w-5 h-5" />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}