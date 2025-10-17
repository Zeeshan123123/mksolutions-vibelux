"use client"

import { DocumentationContent } from '@/components/docs/DocumentationContent'
import { MarketingNavigation } from '@/components/MarketingNavigation'
import { Footer } from '@/components/Footer'

export default function DocsPage() {
  return (
    <>
      <MarketingNavigation />
      <div className="min-h-screen bg-gray-950">
        <DocumentationContent />
      </div>
      <Footer />
    </>
  )
}