'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Plus,
  X,
  Send,
  Reply,
  Heart,
  Pin,
  Edit3,
  Trash2,
  MoreHorizontal,
  Flag,
  Check,
  Clock,
  User,
  Tag
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface Annotation {
  id: string;
  x: number;
  y: number;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  type: 'note' | 'question' | 'issue' | 'suggestion';
  status: 'open' | 'resolved' | 'dismissed';
  replies: AnnotationReply[];
  likes: number;
  isPinned: boolean;
  tags: string[];
  mentions: string[];
}

export interface AnnotationReply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  likes: number;
}

interface AnnotationSystemProps {
  annotations: Annotation[];
  onAnnotationAdd: (annotation: Omit<Annotation, 'id' | 'timestamp' | 'replies' | 'likes' | 'isPinned'>) => void;
  onAnnotationUpdate: (id: string, updates: Partial<Annotation>) => void;
  onAnnotationDelete: (id: string) => void;
  onReplyAdd: (annotationId: string, reply: Omit<AnnotationReply, 'id' | 'timestamp' | 'likes'>) => void;
  currentUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  isAddingAnnotation: boolean;
  onAddingAnnotationChange: (isAdding: boolean) => void;
  containerRef: React.RefObject<HTMLElement>;
  readOnly?: boolean;
  showSidebar?: boolean;
  onSidebarToggle?: () => void;
}

export function AnnotationSystem({
  annotations,
  onAnnotationAdd,
  onAnnotationUpdate,
  onAnnotationDelete,
  onReplyAdd,
  currentUser,
  isAddingAnnotation,
  onAddingAnnotationChange,
  containerRef,
  readOnly = false,
  showSidebar = true,
  onSidebarToggle
}: AnnotationSystemProps) {
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [newAnnotationPos, setNewAnnotationPos] = useState<{ x: number; y: number } | null>(null);
  const [annotationType, setAnnotationType] = useState<Annotation['type']>('note');
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'open' | 'resolved'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'likes'>('newest');

  const handleContainerClick = (e: React.MouseEvent) => {
    if (!isAddingAnnotation || readOnly) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNewAnnotationPos({ x, y });
  };

  const addAnnotation = (content: string, tags: string[] = []) => {
    if (!newAnnotationPos) return;

    const newAnnotation: Omit<Annotation, 'id' | 'timestamp' | 'replies' | 'likes' | 'isPinned'> = {
      x: newAnnotationPos.x,
      y: newAnnotationPos.y,
      content,
      author: currentUser,
      type: annotationType,
      status: 'open',
      tags,
      mentions: []
    };

    onAnnotationAdd(newAnnotation);
    setNewAnnotationPos(null);
    onAddingAnnotationChange(false);
  };

  const updateAnnotation = (id: string, updates: Partial<Annotation>) => {
    onAnnotationUpdate(id, updates);
    setEditingAnnotation(null);
  };

  const toggleAnnotationLike = (id: string) => {
    const annotation = annotations.find(a => a.id === id);
    if (annotation) {
      onAnnotationUpdate(id, { likes: annotation.likes + 1 });
    }
  };

  const toggleAnnotationPin = (id: string) => {
    const annotation = annotations.find(a => a.id === id);
    if (annotation) {
      onAnnotationUpdate(id, { isPinned: !annotation.isPinned });
    }
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

  const getStatusColor = (status: Annotation['status']) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAnnotations = annotations
    .filter(annotation => {
      if (filterType === 'all') return true;
      return annotation.status === filterType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'likes':
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

  return (
    <>
      {/* Annotation Markers */}
      {annotations.map(annotation => (
        <div
          key={annotation.id}
          className="absolute z-10 group"
          style={{ left: annotation.x, top: annotation.y }}
        >
          <div
            className={`w-6 h-6 rounded-full ${getAnnotationColor(annotation.type)} cursor-pointer shadow-lg flex items-center justify-center transition-transform hover:scale-110 ${
              annotation.isPinned ? 'ring-2 ring-yellow-400' : ''
            } ${selectedAnnotation === annotation.id ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedAnnotation(
              selectedAnnotation === annotation.id ? null : annotation.id
            )}
          >
            <span className="text-white text-xs font-bold">
              {annotation.replies.length > 0 ? annotation.replies.length : '!'}
            </span>
          </div>

          {/* Annotation Popup */}
          {selectedAnnotation === annotation.id && (
            <div className="absolute left-8 top-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-96 overflow-hidden flex flex-col">
              {/* Header */}
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
                    <Badge className={`text-xs ${getStatusColor(annotation.status)}`}>
                      {annotation.status}
                    </Badge>
                    <button
                      onClick={() => setSelectedAnnotation(null)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {editingAnnotation === annotation.id ? (
                  <div className="space-y-2">
                    <textarea
                      defaultValue={annotation.content}
                      className="w-full px-2 py-1 text-sm border border-gray-200 rounded resize-none"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          const target = e.target as HTMLTextAreaElement;
                          updateAnnotation(annotation.id, { content: target.value });
                        }
                        if (e.key === 'Escape') {
                          setEditingAnnotation(null);
                        }
                      }}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingAnnotation(null)}
                        className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => {
                          const textarea = e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement;
                          if (textarea) {
                            updateAnnotation(annotation.id, { content: textarea.value });
                          }
                        }}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 mb-3">{annotation.content}</p>
                )}

                {/* Tags */}
                {annotation.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {annotation.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAnnotationLike(annotation.id)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500"
                    >
                      <Heart className="w-3 h-3" />
                      {annotation.likes}
                    </button>
                    {!readOnly && (
                      <>
                        <button
                          onClick={() => toggleAnnotationPin(annotation.id)}
                          className={`p-1 rounded text-xs ${
                            annotation.isPinned ? 'text-yellow-600' : 'text-gray-500 hover:text-yellow-600'
                          }`}
                        >
                          <Pin className="w-3 h-3" />
                        </button>
                        {annotation.author.id === currentUser.id && (
                          <>
                            <button
                              onClick={() => setEditingAnnotation(annotation.id)}
                              className="p-1 rounded text-xs text-gray-500 hover:text-blue-600"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onAnnotationDelete(annotation.id)}
                              className="p-1 rounded text-xs text-gray-500 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  {!readOnly && (
                    <button
                      onClick={() => updateAnnotation(annotation.id, {
                        status: annotation.status === 'resolved' ? 'open' : 'resolved'
                      })}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        annotation.status === 'resolved'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {annotation.status === 'resolved' ? 'Resolved' : 'Mark Resolved'}
                    </button>
                  )}
                </div>
              </div>

              {/* Replies */}
              {annotation.replies.length > 0 && (
                <div className="flex-1 overflow-y-auto border-b border-gray-100">
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
                          <p className="text-xs text-gray-700 mb-1">{reply.content}</p>
                          <button
                            className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
                          >
                            <Heart className="w-2 h-2" />
                            {reply.likes}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input */}
              {!readOnly && (
                <div className="p-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const content = formData.get('reply') as string;
                      if (content.trim()) {
                        onReplyAdd(annotation.id, {
                          content: content.trim(),
                          author: currentUser
                        });
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
              )}
            </div>
          )}
        </div>
      ))}

      {/* New Annotation Modal */}
      {newAnnotationPos && !readOnly && (
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
                const tagsInput = formData.get('tags') as string;
                const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [];
                
                if (content.trim()) {
                  addAnnotation(content.trim(), tags);
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
              <input
                name="tags"
                placeholder="Tags (comma-separated)"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500 mt-2"
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setNewAnnotationPos(null);
                    onAddingAnnotationChange(false);
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

      {/* Click Handler */}
      <div
        className={`absolute inset-0 ${isAddingAnnotation ? 'cursor-crosshair' : 'pointer-events-none'}`}
        onClick={handleContainerClick}
      />
    </>
  );
}