'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Bug, 
  Lightbulb, 
  MessageSquare, 
  Star,
  Send,
  X,
  CheckCircle
} from 'lucide-react'

interface FeedbackSystemProps {
  isOpen: boolean
  onClose: () => void
  currentPage?: string
}

export function FeedbackSystem({ isOpen, onClose, currentPage = 'Unknown' }: FeedbackSystemProps) {
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general'>('bug')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [email, setEmail] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitted(true)
    setIsSubmitting(false)
    
    // Auto-close after success
    setTimeout(() => {
      setIsSubmitted(false)
      onClose()
      // Reset form
      setEmail('')
      setTitle('')
      setDescription('')
      setFeedbackType('bug')
      setPriority('medium')
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-400" />
              Help Improve VibeLux
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {isSubmitted ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Thank You!</h3>
              <p className="text-gray-400">Your feedback has been received. We'll review it and get back to you if needed.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Page Context */}
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <p className="text-sm text-gray-400">
                  <span className="font-medium">Current Page:</span> {currentPage}
                </p>
              </div>

              {/* Feedback Type */}
              <div className="space-y-3">
                <Label className="text-gray-300">What would you like to share?</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    type="button"
                    variant={feedbackType === 'bug' ? 'default' : 'outline'}
                    className={`h-auto p-4 flex flex-col gap-2 ${
                      feedbackType === 'bug' 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'border-gray-700 text-gray-300 hover:bg-gray-800'
                    }`}
                    onClick={() => setFeedbackType('bug')}
                  >
                    <Bug className="w-6 h-6" />
                    <span className="text-sm">Report Bug</span>
                  </Button>
                  <Button
                    type="button"
                    variant={feedbackType === 'feature' ? 'default' : 'outline'}
                    className={`h-auto p-4 flex flex-col gap-2 ${
                      feedbackType === 'feature' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'border-gray-700 text-gray-300 hover:bg-gray-800'
                    }`}
                    onClick={() => setFeedbackType('feature')}
                  >
                    <Lightbulb className="w-6 h-6" />
                    <span className="text-sm">Feature Idea</span>
                  </Button>
                  <Button
                    type="button"
                    variant={feedbackType === 'general' ? 'default' : 'outline'}
                    className={`h-auto p-4 flex flex-col gap-2 ${
                      feedbackType === 'general' 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'border-gray-700 text-gray-300 hover:bg-gray-800'
                    }`}
                    onClick={() => setFeedbackType('general')}
                  >
                    <Star className="w-6 h-6" />
                    <span className="text-sm">General Feedback</span>
                  </Button>
                </div>
              </div>

              {/* Priority (only for bugs) */}
              {feedbackType === 'bug' && (
                <div className="space-y-3">
                  <Label className="text-gray-300">Priority Level</Label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map((level) => (
                      <Button
                        key={level}
                        type="button"
                        variant={priority === level ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPriority(level)}
                        className={`capitalize ${
                          priority === level
                            ? level === 'high' ? 'bg-red-600 hover:bg-red-700' :
                              level === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700' :
                              'bg-green-600 hover:bg-green-700'
                            : 'border-gray-700 text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-2">
                <Label htmlFor="feedback-email" className="text-gray-300">
                  Email (optional - for follow-up)
                </Label>
                <Input
                  id="feedback-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="feedback-title" className="text-gray-300">
                  {feedbackType === 'bug' ? 'Bug Summary' : 
                   feedbackType === 'feature' ? 'Feature Title' : 'Subject'}
                  <span className="text-red-400 ml-1">*</span>
                </Label>
                <Input
                  id="feedback-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    feedbackType === 'bug' ? 'Calculator gives wrong PPFD result' :
                    feedbackType === 'feature' ? 'Add spectrum analysis calculator' :
                    'General feedback about VibeLux'
                  }
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="feedback-description" className="text-gray-300">
                  {feedbackType === 'bug' ? 'Steps to Reproduce' : 'Description'}
                  <span className="text-red-400 ml-1">*</span>
                </Label>
                <Textarea
                  id="feedback-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    feedbackType === 'bug' 
                      ? '1. Go to PPFD calculator\n2. Enter 600W, 2.5 efficacy, 1m²\n3. Expected 1500 PPFD but got 1200' :
                    feedbackType === 'feature'
                      ? 'It would be helpful to have a calculator that analyzes LED spectrums and recommends optimal ratios for different growth stages...' :
                      'I love the professional calculators! The interface is intuitive and results are accurate. One suggestion...'
                  }
                  className="bg-gray-800 border-gray-700 text-white min-h-[120px]"
                  required
                />
              </div>

              {/* Submit */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <div className="text-sm text-gray-400">
                  All feedback is reviewed by our engineering team
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !title.trim() || !description.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Feedback
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}