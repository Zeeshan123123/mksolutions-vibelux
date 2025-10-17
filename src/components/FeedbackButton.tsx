'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import { FeedbackSystem } from './FeedbackSystem'

interface FeedbackButtonProps {
  currentPage?: string
  className?: string
}

export function FeedbackButton({ currentPage, className = '' }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className={`border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white ${className}`}
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Feedback
      </Button>
      
      <FeedbackSystem 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        currentPage={currentPage}
      />
    </>
  )
}