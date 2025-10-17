'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Share2,
  MessageCircle,
  Plus,
  Edit3,
  Eye,
  Lock,
  Unlock,
  Users,
  Clock,
  Pin,
  X,
  Send,
  Reply,
  Heart,
  Flag,
  Download,
  Link,
  Copy,
  Settings,
  Filter,
  Search,
  MoreHorizontal,
  Bookmark,
  Bell,
  Calendar,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Annotation {
  id: string;
  x: number;
  y: number;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: string;
  type: 'note' | 'question' | 'issue' | 'suggestion';
  status: 'open' | 'resolved' | 'dismissed';
  replies: AnnotationReply[];
  likes: number;
  isPinned: boolean;
  tags: string[];
}

interface AnnotationReply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: string;
}

interface DashboardShare {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  shareUrl: string;
  permissions: {
    canView: boolean;
    canComment: boolean;
    canEdit: boolean;
    canShare: boolean;
  };
  viewers: DashboardViewer[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

interface DashboardViewer {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'editor' | 'commenter' | 'viewer';
  lastViewed: string;
  isOnline: boolean;
}

export function ShareableDashboard() {
  const [annotations, setAnnotations] = useState<Annotation[]>([
    {
      id: '1',
      x: 250,
      y: 150,
      content: 'Temperature spike detected at 14:30. Investigate HVAC settings.',
      author: { id: '1', name: 'John Smith', avatar: '/avatars/john.jpg' },
      timestamp: '2024-07-19T14:35:00Z',
      type: 'issue',
      status: 'open',
      replies: [
        {
          id: '1-1',
          content: 'Checking the HVAC logs now. Will update shortly.',
          author: { id: '2', name: 'Sarah Johnson', avatar: '/avatars/sarah.jpg' },
          timestamp: '2024-07-19T14:40:00Z'
        }
      ],
      likes: 2,
      isPinned: true,
      tags: ['hvac', 'temperature', 'urgent']
    },
    {
      id: '2',
      x: 450,
      y: 280,
      content: 'Great efficiency improvement! Can we replicate this in Zone B?',
      author: { id: '3', name: 'Mike Davis', avatar: '/avatars/mike.jpg' },
      timestamp: '2024-07-19T13:15:00Z',
      type: 'suggestion',
      status: 'open',
      replies: [],
      likes: 5,
      isPinned: false,
      tags: ['efficiency', 'zone-b', 'optimization']
    }
  ]);

  const [shareSettings, setShareSettings] = useState<DashboardShare>({
    id: 'dash-123',
    name: 'Q3 Performance Dashboard',
    description: 'Quarterly performance metrics and energy efficiency analysis',
    isPublic: false,
    shareUrl: 'https://vibelux.ai/shared/dash-123',
    permissions: {
      canView: true,
      canComment: true,
      canEdit: false,
      canShare: false
    },
    viewers: [
      {
        id: '1',
        name: 'John Smith',
        avatar: '/avatars/john.jpg',
        role: 'owner',
        lastViewed: '2024-07-19T15:30:00Z',
        isOnline: true
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        avatar: '/avatars/sarah.jpg',
        role: 'editor',
        lastViewed: '2024-07-19T15:25:00Z',
        isOnline: true
      },
      {
        id: '3',
        name: 'Mike Davis',
        avatar: '/avatars/mike.jpg',
        role: 'commenter',
        lastViewed: '2024-07-19T14:45:00Z',
        isOnline: false
      }
    ],
    createdAt: '2024-07-15T10:00:00Z',
    updatedAt: '2024-07-19T15:30:00Z'
  });

  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [newAnnotationPos, setNewAnnotationPos] = useState<{ x: number; y: number } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [commentFilter, setCommentFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [annotationType, setAnnotationType] = useState<Annotation['type']>('note');

  const dashboardRef = useRef<HTMLDivElement>(null);

  const handleDashboardClick = (e: React.MouseEvent) => {
    if (!isAddingAnnotation) return;

    const rect = dashboardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNewAnnotationPos({ x, y });
  };

  const addAnnotation = (content: string) => {
    if (!newAnnotationPos) return;

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      x: newAnnotationPos.x,
      y: newAnnotationPos.y,
      content,
      author: { id: '1', name: 'John Smith', avatar: '/avatars/john.jpg' },
      timestamp: new Date().toISOString(),
      type: annotationType,
      status: 'open',
      replies: [],
      likes: 0,
      isPinned: false,
      tags: []
    };

    setAnnotations([...annotations, newAnnotation]);
    setNewAnnotationPos(null);
    setIsAddingAnnotation(false);
  };

  const addReply = (annotationId: string, content: string) => {
    setAnnotations(annotations.map(annotation => {
      if (annotation.id === annotationId) {
        const newReply: AnnotationReply = {
          id: `${annotationId}-${Date.now()}`,
          content,
          author: { id: '1', name: 'John Smith', avatar: '/avatars/john.jpg' },
          timestamp: new Date().toISOString()
        };
        return { ...annotation, replies: [...annotation.replies, newReply] };
      }
      return annotation;
    }));
  };

  const toggleAnnotationStatus = (id: string) => {
    setAnnotations(annotations.map(annotation => {
      if (annotation.id === id) {
        return {
          ...annotation,
          status: annotation.status === 'open' ? 'resolved' : 'open'
        };
      }
      return annotation;
    }));
  };

  const likeAnnotation = (id: string) => {
    setAnnotations(annotations.map(annotation => {
      if (annotation.id === id) {
        return { ...annotation, likes: annotation.likes + 1 };
      }
      return annotation;
    }));
  };

  const pinAnnotation = (id: string) => {
    setAnnotations(annotations.map(annotation => {
      if (annotation.id === id) {
        return { ...annotation, isPinned: !annotation.isPinned };
      }
      return annotation;
    }));
  };

  const copyShareUrl = async () => {
    await navigator.clipboard.writeText(shareSettings.shareUrl);
    // Show toast notification
  };

  const getAnnotationColor = (type: Annotation['type']) => {
    switch (type) {
      case 'note': return 'bg-blue-500';
      case 'question': return 'bg-purple-500';
      case 'issue': return 'bg-red-500';
      case 'suggestion': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredAnnotations = annotations.filter(annotation => {
    if (commentFilter === 'all') return true;
    return annotation.status === commentFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{shareSettings.name}</h1>
              <p className="text-sm text-gray-600">{shareSettings.description}</p>
            </div>
            <Badge variant={shareSettings.isPublic ? "default" : "secondary"}>
              {shareSettings.isPublic ? (
                <><Unlock className="w-3 h-3 mr-1" /> Public</>
              ) : (
                <><Lock className="w-3 h-3 mr-1" /> Private</>
              )}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Active Viewers */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {shareSettings.viewers.slice(0, 3).map(viewer => (
                  <div
                    key={viewer.id}
                    className={`relative w-8 h-8 rounded-full border-2 border-white overflow-hidden ${
                      viewer.isOnline ? 'ring-2 ring-green-400' : ''
                    }`}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                      {viewer.name.substring(0, 2).toUpperCase()}
                    </div>
                    {viewer.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                    )}
                  </div>
                ))}
                {shareSettings.viewers.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                    +{shareSettings.viewers.length - 3}
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {shareSettings.viewers.filter(v => v.isOnline).length} online
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              <button
                onClick={() => setShowComments(!showComments)}
                className={`p-2 rounded-lg transition-colors ${
                  showComments ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsAddingAnnotation(!isAddingAnnotation)}
                className={`p-2 rounded-lg transition-colors ${
                  isAddingAnnotation ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Main Dashboard Area */}
        <div className="flex-1 relative overflow-auto">
          <div
            ref={dashboardRef}
            className={`relative min-h-full p-6 ${isAddingAnnotation ? 'cursor-crosshair' : ''}`}
            onClick={handleDashboardClick}
          >
            {/* Sample Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Energy Efficiency Trends</CardTitle>
                  <CardDescription>Last 30 days performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">94.2%</div>
                    <div className="text-sm text-gray-600">Average Efficiency</div>
                    <div className="text-xs text-green-600 mt-1">↑ 2.1% from last month</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Consumption</CardTitle>
                  <CardDescription>Power and water usage breakdown</CardDescription>
                </CardHeader>
                <CardContent className="h-64 bg-gradient-to-br from-green-50 to-emerald-100 rounded flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">1,247 kWh</div>
                    <div className="text-sm text-gray-600">Daily Average</div>
                    <div className="text-xs text-red-600 mt-1">↓ 5.3% from target</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Performance Matrix</CardTitle>
                <CardDescription>Real-time monitoring across all facility zones</CardDescription>
              </CardHeader>
              <CardContent className="h-96 bg-gradient-to-br from-purple-50 to-pink-100 rounded flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">Live Dashboard</div>
                  <div className="text-sm text-gray-600">Interactive charts and metrics would appear here</div>
                  <div className="mt-4 grid grid-cols-3 gap-4 max-w-md">
                    <div className="bg-white/50 rounded p-3">
                      <div className="text-lg font-semibold text-gray-800">Zone A</div>
                      <div className="text-sm text-green-600">Optimal</div>
                    </div>
                    <div className="bg-white/50 rounded p-3">
                      <div className="text-lg font-semibold text-gray-800">Zone B</div>
                      <div className="text-sm text-yellow-600">Warning</div>
                    </div>
                    <div className="bg-white/50 rounded p-3">
                      <div className="text-lg font-semibold text-gray-800">Zone C</div>
                      <div className="text-sm text-green-600">Optimal</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Annotations */}
            {filteredAnnotations.map(annotation => (
              <div
                key={annotation.id}
                className="absolute z-10 group"
                style={{ left: annotation.x, top: annotation.y }}
              >
                <div
                  className={`w-6 h-6 rounded-full ${getAnnotationColor(annotation.type)} cursor-pointer shadow-lg flex items-center justify-center transition-transform hover:scale-110 ${
                    annotation.isPinned ? 'ring-2 ring-yellow-400' : ''
                  }`}
                  onClick={() => setSelectedAnnotation(
                    selectedAnnotation === annotation.id ? null : annotation.id
                  )}
                >
                  <span className="text-white text-xs font-bold">
                    {annotation.replies.length > 0 ? annotation.replies.length : '!'}
                  </span>
                </div>

                {selectedAnnotation === annotation.id && (
                  <div className="absolute left-8 top-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {annotation.author.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{annotation.author.name}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(annotation.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {annotation.type}
                          </Badge>
                          <button
                            onClick={() => setSelectedAnnotation(null)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{annotation.content}</p>
                      
                      {annotation.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {annotation.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => likeAnnotation(annotation.id)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500"
                          >
                            <Heart className="w-3 h-3" />
                            {annotation.likes}
                          </button>
                          <button
                            onClick={() => pinAnnotation(annotation.id)}
                            className={`p-1 rounded text-xs ${
                              annotation.isPinned ? 'text-yellow-600' : 'text-gray-500 hover:text-yellow-600'
                            }`}
                          >
                            <Pin className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => toggleAnnotationStatus(annotation.id)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            annotation.status === 'resolved'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {annotation.status === 'resolved' ? 'Resolved' : 'Mark Resolved'}
                        </button>
                      </div>
                    </div>

                    {/* Replies */}
                    {annotation.replies.length > 0 && (
                      <div className="max-h-32 overflow-y-auto border-b border-gray-100">
                        {annotation.replies.map(reply => (
                          <div key={reply.id} className="p-3 border-b border-gray-50 last:border-b-0">
                            <div className="flex items-start gap-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                {reply.author.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-gray-900">{reply.author.name}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(reply.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700">{reply.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input */}
                    <div className="p-3">
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const content = formData.get('reply') as string;
                          if (content.trim()) {
                            addReply(annotation.id, content.trim());
                            e.currentTarget.reset();
                          }
                        }}
                        className="flex gap-2"
                      >
                        <input
                          name="reply"
                          placeholder="Add a reply..."
                          className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="submit"
                          className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* New Annotation Modal */}
            {newAnnotationPos && (
              <div
                className="absolute z-20"
                style={{ left: newAnnotationPos.x, top: newAnnotationPos.y }}
              >
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80">
                  <h3 className="font-medium text-gray-900 mb-3">Add Annotation</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const content = formData.get('content') as string;
                      if (content.trim()) {
                        addAnnotation(content.trim());
                      }
                    }}
                  >
                    <div className="mb-3">
                      <select
                        value={annotationType}
                        onChange={(e) => setAnnotationType(e.target.value as Annotation['type'])}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                      >
                        <option value="note">Note</option>
                        <option value="question">Question</option>
                        <option value="issue">Issue</option>
                        <option value="suggestion">Suggestion</option>
                      </select>
                    </div>
                    <textarea
                      name="content"
                      placeholder="Enter your annotation..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500 resize-none"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setNewAnnotationPos(null);
                          setIsAddingAnnotation(false);
                        }}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comments Sidebar */}
        {showComments && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900">Comments</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={commentFilter}
                    onChange={(e) => setCommentFilter(e.target.value as typeof commentFilter)}
                    className="text-xs border border-gray-200 rounded px-2 py-1"
                  >
                    <option value="all">All</option>
                    <option value="open">Open</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {filteredAnnotations.length} {commentFilter} comments
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredAnnotations.map(annotation => (
                <div
                  key={annotation.id}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedAnnotation === annotation.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedAnnotation(annotation.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full ${getAnnotationColor(annotation.type)} flex-shrink-0 mt-1`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{annotation.author.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {annotation.type}
                        </Badge>
                        {annotation.isPinned && <Pin className="w-3 h-3 text-yellow-600" />}
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">{annotation.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(annotation.timestamp).toLocaleDateString()}</span>
                        <div className="flex items-center gap-2">
                          {annotation.replies.length > 0 && (
                            <span>{annotation.replies.length} replies</span>
                          )}
                          <span className={`px-1.5 py-0.5 rounded ${
                            annotation.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {annotation.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Share Dashboard</h2>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Share URL</label>
                  <div className="flex gap-2">
                    <input
                      value={shareSettings.shareUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                    />
                    <button
                      onClick={copyShareUrl}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" checked={shareSettings.permissions.canView} readOnly className="mr-2" />
                      <span className="text-sm">Can view</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" checked={shareSettings.permissions.canComment} readOnly className="mr-2" />
                      <span className="text-sm">Can comment</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" checked={shareSettings.permissions.canEdit} readOnly className="mr-2" />
                      <span className="text-sm">Can edit</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Access Level</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option>Private - Only invited users</option>
                    <option>Organization - Anyone in your organization</option>
                    <option>Public - Anyone with the link</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                  Update Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}