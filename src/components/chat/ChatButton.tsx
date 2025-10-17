'use client';

import React, { useState } from 'react';
import { MessageSquare, Users } from 'lucide-react';
import { TeamChat } from './TeamChat';

interface ChatButtonProps {
  facilityId?: string;
  className?: string;
}

export function ChatButton({ facilityId = 'default', className = '' }: ChatButtonProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsChatOpen(true)}
        className={`relative p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105 ${className}`}
        title="Open Team Chat"
      >
        <MessageSquare className="w-6 h-6" />
        
        {/* Notification Badge */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
          3
        </div>
      </button>

      <TeamChat 
        facilityId={facilityId}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
}

// Alternative compact version for dashboard
export function ChatWidget({ facilityId = 'default' }: { facilityId?: string }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Team Chat</h3>
          </div>
          <button
            onClick={() => setIsChatOpen(true)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            Open
          </button>
        </div>
        
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex justify-between">
            <span>Active Users</span>
            <span className="text-green-400">4 online</span>
          </div>
          <div className="flex justify-between">
            <span>Unread Messages</span>
            <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">3</span>
          </div>
          <div className="flex justify-between">
            <span>Channels</span>
            <span className="text-white">6</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-500">Recent Activity</div>
          <div className="mt-1 text-sm text-gray-300">
            Sarah: "Zone 3 looks great today!"
          </div>
          <div className="text-xs text-gray-500 mt-1">2 minutes ago</div>
        </div>
      </div>

      <TeamChat 
        facilityId={facilityId}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
}