'use client';

import { SignIn } from '@clerk/nextjs';
import { clerkConfig } from '@/lib/clerk-config';

export default function SignInPage() {

  console.log("process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:", process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back to <span className="bg-gradient-to-r from-green-400 to-purple-600 bg-clip-text text-transparent">VibeLux</span>
          </h1>
          <p className="text-gray-400">
            Sign in to access your agricultural intelligence platform
          </p>
        </div>
        
        <SignIn 
          appearance={clerkConfig.appearance}
          signUpUrl="/sign-up"
          afterSignInUrl="/dashboard"
          routing="path"
          path="/sign-in"
        />
      </div>
    </div>
  );
}