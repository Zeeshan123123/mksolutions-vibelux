'use client'

import { UserProfile } from '@clerk/nextjs'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                VibeLux Profile
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            User Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex justify-center">
          <UserProfile 
            appearance={{
              elements: {
                card: 'shadow-lg border border-gray-200 dark:border-gray-700',
                navbar: 'bg-gray-50 dark:bg-gray-800',
                navbarButton: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white',
                navbarButtonActive: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
                formButtonPrimary: 'bg-green-600 hover:bg-green-700 text-sm normal-case'
              }
            }}
          />
        </div>
      </main>
    </div>
  )
}