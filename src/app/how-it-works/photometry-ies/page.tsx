'use client'

import Link from 'next/link'
import { HowItWorksStrip } from '@/components/marketing/HowItWorksStrip'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Upload, CheckCircle, Zap, Lightbulb, BarChart3, ArrowRight } from 'lucide-react'

export default function PhotometryIESHowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">How Photometry & IES Files Work in VibeLux</h1>
          <p className="text-gray-400 mt-3 max-w-3xl mx-auto">
            Import manufacturer photometric data (IES/LDT) to drive accurate PPFD, uniformity, and lighting analysis
            in the AI Designer and calculators.
          </p>
        </div>

        <HowItWorksStrip
          heading="Workflow overview"
          subheading="Bring real photometry into designs and calculations."
          planNotice="Pro plan: advanced IES comparison, reporting, and exports"
          steps={[
            { title: 'Get the file', description: 'Download LM-63 (IES) or LDT file from the manufacturer', href: '/fixtures', ctaLabel: 'Find Fixtures' },
            { title: 'Upload & validate', description: 'Use IES Manager to import and check candela data', href: '/design/advanced?tab=photometry', ctaLabel: 'Open IES Manager' },
            { title: 'Use in Designer', description: 'Place fixtures; PPFD engine uses IES distributions', href: '/design/advanced', ctaLabel: 'AI Designer' },
            { title: 'Analyze & export', description: 'Compare distributions, run maps, export reports', href: '/export-center', ctaLabel: 'Export Center' },
          ]}
        />

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" /> Supported formats
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-300 space-y-2">
              <p>• IES LM-63 photometric files (commonly .ies)</p>
              <p>• EULUMDAT (.ldt) where provided by some vendors</p>
              <p>• Parsed data: candela distribution, vertical/horizontal angles, tilt, lumens</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-green-400" /> Upload & validation
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-300 space-y-2">
              <p>• Open IES Manager in the Designer to upload files</p>
              <p>• Automatic schema checks and metadata extraction</p>
              <p>• Visual check of distribution; compare multiple files</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" /> In calculations
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-300 space-y-2">
              <p>• PPFD engine reads IES candela tables per angle</p>
              <p>• Improves accuracy of maps, average PPFD, uniformity</p>
              <p>• Falls back to beam angle/PPF if no IES data present</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" /> Best practices
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-300 space-y-2">
              <p>• Use manufacturer IES from the exact SKU/optic</p>
              <p>• Verify mounting height and tilt match the design</p>
              <p>• Compare multiple IES files when selecting fixtures</p>
              <p>• For missing IES, request from vendor or use library default</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" /> Where to use
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-300 space-y-2">
              <p>• AI Designer for placement, PPFD, and uniformity</p>
              <p>• PPFD Map and Coverage Area calculators</p>
              <p>• Electrical estimator and panel schedules (indirect)</p>
              <div className="pt-2">
                <Link href="/design/advanced" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300">
                  Open AI Designer <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-teal-400" /> FAQs
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-300 space-y-3">
              <div>
                <p className="font-medium text-white">What if my fixture has no IES file?</p>
                <p className="text-gray-400">You can still design using nominal PPF/beam angle. Accuracy improves when an IES is provided.</p>
              </div>
              <div>
                <p className="font-medium text-white">Do you support LDT?</p>
                <p className="text-gray-400">Yes, where provided. Some vendors prefer LDT; we parse standard fields and convert to our internal format.</p>
              </div>
              <div>
                <p className="font-medium text-white">How is IES used in PPFD?</p>
                <p className="text-gray-400">We sample candela distribution over angle to weight intensity at each canopy point, improving min/avg metrics.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


