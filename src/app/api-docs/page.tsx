"use client"

import { APIDocumentation } from '@/components/APIDocumentation'
import { MarketingNavigation } from '@/components/MarketingNavigation'
import { Footer } from '@/components/Footer'

export default function APIDocsPage() {
  return (
    <>
      <MarketingNavigation />
      <div className="min-h-screen bg-gray-950">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-white">API Documentation</h1>
          <APIDocumentation />
        </div>
      </div>
      <Footer />
    </>
  )
}