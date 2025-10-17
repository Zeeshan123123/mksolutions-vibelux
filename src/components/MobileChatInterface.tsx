'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  MobileContainer, 
  MobileCard, 
  MobileButton, 
  MobileInput,
  MobileSlidePanel 
} from '@/components/ui/mobile-responsive'
import { 
  Send, 
  Mic, 
  Paperclip, 
  MoreVertical, 
  AlertTriangle, 
  RefreshCw,
  X,
  Bot,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
  error?: string
}

interface ChatError {
  type: 'network' | 'rate_limit' | 'quota' | 'general'
  message: string
  retryable: boolean
}

const mockMessages: Message[] = [
  {
    id: '1',
    type: 'assistant',
    content: 'Hello! I can help you with lighting design, energy calculations, and facility optimization. What would you like me to help you with today?',
    timestamp: new Date(Date.now() - 300000),
    status: 'sent'
  },
  {
    id: '2',
    type: 'user',
    content: 'can you design me a quick 4\'x4\' grow with best light uniformity from dlc list',
    timestamp: new Date(Date.now() - 240000),
    status: 'sent'
  },
  {
    id: '3',
    type: 'assistant',
    content: 'I encountered an error processing your request with Claude. Please try again.',
    timestamp: new Date(Date.now() - 180000),
    status: 'error',
    error: 'AI service temporarily unavailable'
  }
]

export function MobileChatInterface() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<ChatError | null>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [credits, setCredits] = useState(5)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      status: 'sending'
    }

    setMessages(prev => [...prev, newMessage])
    setInputValue('')
    setError(null)
    setIsTyping(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate different error scenarios for demonstration
      const shouldError = Math.random() < 0.3
      
      if (shouldError) {
        const errorTypes: ChatError[] = [
          {
            type: 'quota',
            message: 'You\'ve reached your daily AI query limit. Get more credits to continue.',
            retryable: false
          },
          {
            type: 'rate_limit',
            message: 'Too many requests. Please wait a moment before trying again.',
            retryable: true
          },
          {
            type: 'network',
            message: 'Connection error. Please check your internet and try again.',
            retryable: true
          }
        ]
        
        const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)]
        setError(randomError)
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: 'error', error: randomError.message }
              : msg
          )
        )
      } else {
        // Success response
        setMessages(prev => [
          ...prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: 'sent' }
              : msg
          ),
          {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: `I'd be happy to help you design a 4'x4' grow space with optimal light uniformity. For a 16 sq ft area, I recommend using 4 high-efficiency LED fixtures from the DLC qualified products list. This will provide excellent PPFD uniformity across the canopy. Would you like me to generate a detailed lighting layout with specific fixture recommendations?`,
            timestamp: new Date(),
            status: 'sent'
          }
        ])
        setCredits(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      setError({
        type: 'general',
        message: 'Something went wrong. Please try again.',
        retryable: true
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handleRetry = (messageId: string) => {
    const message = messages.find(m => m.id === messageId)
    if (message && message.type === 'user') {
      setInputValue(message.content)
      setMessages(prev => prev.filter(m => m.id !== messageId))
      setError(null)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const getMessageIcon = (message: Message) => {
    if (message.type === 'user') return User
    if (message.type === 'system') return Info
    return Bot
  }

  const getStatusIcon = (status?: Message['status']) => {
    switch (status) {
      case 'sending': return Clock
      case 'sent': return CheckCircle2
      case 'error': return AlertCircle
      default: return null
    }
  }

  return (
    <div className="flex flex-col h-full max-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                AI Assistant
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {credits} credits remaining
              </p>
            </div>
          </div>
          <MobileButton
            variant="ghost"
            size="sm"
            onClick={() => setShowOptions(true)}
          >
            <MoreVertical className="w-5 h-5" />
          </MobileButton>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className={cn(
          "px-4 py-3 border-b",
          error.type === 'quota' 
            ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800" 
            : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
        )}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={cn(
              "w-5 h-5 mt-0.5 flex-shrink-0",
              error.type === 'quota' 
                ? "text-yellow-600 dark:text-yellow-400" 
                : "text-red-600 dark:text-red-400"
            )} />
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium",
                error.type === 'quota' 
                  ? "text-yellow-800 dark:text-yellow-200" 
                  : "text-red-800 dark:text-red-200"
              )}>
                {error.message}
              </p>
              {error.retryable && (
                <MobileButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="mt-2 p-0 h-auto text-xs"
                >
                  Dismiss
                </MobileButton>
              )}
            </div>
            <MobileButton
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
            >
              <X className="w-4 h-4" />
            </MobileButton>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => {
          const IconComponent = getMessageIcon(message)
          const StatusIcon = getStatusIcon(message.status)
          const isUser = message.type === 'user'
          
          return (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                isUser ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                isUser 
                  ? "bg-blue-600" 
                  : message.type === 'system' 
                    ? "bg-gray-500" 
                    : "bg-green-600"
              )}>
                <IconComponent className="w-4 h-4 text-white" />
              </div>
              
              <div className={cn(
                "flex-1 min-w-0",
                isUser ? "flex flex-col items-end" : ""
              )}>
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  isUser
                    ? "bg-blue-600 text-white"
                    : message.status === 'error'
                      ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                )}>
                  <p className={cn(
                    "text-sm whitespace-pre-wrap",
                    isUser 
                      ? "text-white" 
                      : message.status === 'error'
                        ? "text-red-800 dark:text-red-200"
                        : "text-gray-900 dark:text-gray-100"
                  )}>
                    {message.content}
                  </p>
                  
                  {message.status === 'error' && message.error && (
                    <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-700">
                      <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                        {message.error}
                      </p>
                      <MobileButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetry(message.id)}
                        className="text-xs"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Retry
                      </MobileButton>
                    </div>
                  )}
                </div>
                
                <div className={cn(
                  "flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400",
                  isUser ? "flex-row-reverse" : ""
                )}>
                  <span>{formatTime(message.timestamp)}</span>
                  {StatusIcon && (
                    <StatusIcon className={cn(
                      "w-3 h-3",
                      message.status === 'error' 
                        ? "text-red-500" 
                        : message.status === 'sent' 
                          ? "text-green-500" 
                          : "text-gray-400"
                    )} />
                  )}
                </div>
              </div>
            </div>
          )
        })}
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about lighting design..."
              className="w-full resize-none rounded-2xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none max-h-32"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              style={{
                height: 'auto',
                minHeight: '44px'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`
              }}
            />
          </div>
          
          <div className="flex gap-2">
            <MobileButton
              variant="ghost"
              size="sm"
              className="w-11 h-11 rounded-full"
            >
              <Paperclip className="w-5 h-5" />
            </MobileButton>
            
            <MobileButton
              variant="primary"
              size="sm"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="w-11 h-11 rounded-full"
            >
              <Send className="w-5 h-5" />
            </MobileButton>
          </div>
        </div>
        
        {credits <= 2 && (
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              You're running low on credits. 
              <MobileButton variant="ghost" className="ml-1 p-0 h-auto text-yellow-600 dark:text-yellow-400 underline">
                Get more
              </MobileButton>
            </p>
          </div>
        )}
      </div>

      {/* Options Panel */}
      <MobileSlidePanel
        isOpen={showOptions}
        onClose={() => setShowOptions(false)}
        title="Chat Options"
      >
        <div className="p-4 space-y-4">
          <MobileButton variant="outline" className="w-full justify-start">
            Clear conversation
          </MobileButton>
          <MobileButton variant="outline" className="w-full justify-start">
            Export chat
          </MobileButton>
          <MobileButton variant="outline" className="w-full justify-start">
            Settings
          </MobileButton>
          <MobileButton variant="outline" className="w-full justify-start">
            Help & Support
          </MobileButton>
        </div>
      </MobileSlidePanel>
    </div>
  )
}

export default MobileChatInterface