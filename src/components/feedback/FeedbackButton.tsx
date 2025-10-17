'use client';

import React, { useState } from 'react';
import { MessageSquarePlus, Lightbulb } from 'lucide-react';
import { FeatureRequestModal } from './FeatureRequestModal';

interface FeedbackButtonProps {
  variant?: 'floating' | 'inline' | 'header';
  className?: string;
}

export function FeedbackButton({ variant = 'floating', className = '' }: FeedbackButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const baseClasses = "inline-flex items-center space-x-2 transition-colors";
  
  const variantClasses = {
    floating: "fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl",
    inline: "bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-lg border border-gray-600",
    header: "text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800"
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        title="Share feedback or request features"
      >
        {variant === 'floating' ? (
          <MessageSquarePlus className="w-5 h-5" />
        ) : (
          <>
            <Lightbulb className="w-4 h-4" />
            <span className="text-sm font-medium">Feedback</span>
          </>
        )}
      </button>

      <FeatureRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}