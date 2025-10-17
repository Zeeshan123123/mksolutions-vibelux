'use client';

import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const router = useRouter();
  
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-lg p-6 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">You're Offline</h1>
        <p className="text-gray-300 mb-6">
          No internet connection. Some features may be limited until you reconnect.
        </p>
        
        <button 
          onClick={handleRetry}
          className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
        
        <div className="mt-6 text-sm text-gray-400">
          <p>VibeLux works offline with cached data</p>
        </div>
      </div>
    </div>
  );
}