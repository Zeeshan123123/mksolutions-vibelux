'use client'

import React from 'react'
import Link from 'next/link'

export type HowItWorksStep = {
  title: string
  description?: string
  icon?: React.ReactNode
  ctaLabel?: string
  href?: string
}

export function HowItWorksStrip({
  heading = 'How it works',
  subheading,
  steps,
  dense = false,
  planNotice,
  utm = true,
}: {
  heading?: string
  subheading?: string
  steps: HowItWorksStep[]
  dense?: boolean
  planNotice?: string
  utm?: boolean
}) {
  const buildHref = (href?: string, index?: number) => {
    if (!href) return '#'
    if (!utm) return href
    try {
      // Handle internal and external links
      const isAbsolute = href.startsWith('http://') || href.startsWith('https://')
      const url = isAbsolute ? new URL(href) : new URL(href, 'https://example.com')
      const params = url.searchParams
      params.set('utm_source', 'vibelux')
      params.set('utm_medium', 'howitworks')
      params.set('utm_campaign', 'feature_education')
      params.set('utm_content', `${heading.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${(index ?? 0) + 1}`)
      url.search = params.toString()
      return isAbsolute ? url.toString() : `${url.pathname}${url.search}`
    } catch {
      return href
    }
  }

  return (
    <section className={dense ? 'py-10' : 'py-16'}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className={`font-bold text-white ${dense ? 'text-2xl' : 'text-4xl'} mb-3`}>{heading}</h2>
          {subheading && (
            <p className={`text-gray-400 mx-auto ${dense ? 'text-sm max-w-2xl' : 'text-lg max-w-3xl'}`}>{subheading}</p>
          )}
          {planNotice && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-700 bg-purple-900/30 text-purple-200 text-xs">
              {planNotice}
            </div>
          )}
        </div>

        <div className={`grid gap-6 ${dense ? 'md:grid-cols-4' : 'md:grid-cols-4'}`}>
          {steps.map((step, idx) => (
            <div key={idx} className="bg-gray-900/60 rounded-xl border border-gray-800 p-6 h-full">
              <div className="flex items-start gap-4">
                {step.icon && <div className="text-purple-400 mt-1">{step.icon}</div>}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-800">{idx + 1}</span>
                    <h3 className={`${dense ? 'text-base' : 'text-lg'} font-semibold text-white`}>{step.title}</h3>
                  </div>
                  {step.description && (
                    <p className={`${dense ? 'text-xs' : 'text-sm'} text-gray-400 mb-3`}>{step.description}</p>
                  )}
                  {step.ctaLabel && step.href && (
                    <Link
                      href={buildHref(step.href, idx)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-700 hover:border-purple-600 transition-colors ${dense ? 'text-xs' : 'text-sm'} text-gray-200`}
                    >
                      {step.ctaLabel}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksStrip


