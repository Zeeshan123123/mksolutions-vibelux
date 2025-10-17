'use client';

import { SignUp } from '@clerk/nextjs';
import { clerkConfig } from '@/lib/clerk-config';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Join <span className="bg-gradient-to-r from-green-400 to-purple-600 bg-clip-text text-transparent">VibeLux</span>
          </h1>
          <p className="text-gray-400">
            Create your account to access advanced agricultural intelligence
          </p>
        </div>
        
        <SignUp 
          appearance={clerkConfig.appearance}
          signInUrl="/sign-in"
          afterSignUpUrl="/dashboard"
          routing="path"
          path="/sign-up"
        />
      </div>
    </div>
  );
}