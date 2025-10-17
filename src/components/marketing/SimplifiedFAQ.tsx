'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ENERGY_SAVINGS, YIELD_IMPROVEMENTS } from './ConsolidatedMarketing'

const faqs = [
  {
    question: 'How quickly can I get started?',
    answer: 'You can start using VibeLux immediately. Sign up takes less than a minute, and you can begin designing your first lighting layout right away. Credit card is required to start your 14-day free trial, but you won\'t be charged until after the trial period ends.'
  },
  {
    question: 'What file formats does VibeLux support?',
    answer: 'We support DWG, DXF, Revit, SketchUp, IFC, and 60+ other CAD formats for import. You can export to DWG, DXF, PDF, and Excel for professional documentation.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We use bank-level encryption, automated backups, and secure cloud storage. Your designs and data are private and protected with enterprise-grade security.'
  },
  {
    question: 'Can I collaborate with my team?',
    answer: 'Absolutely. VibeLux includes team collaboration features, allowing you to share designs, leave comments, and work together in real-time.'
  },
  {
    question: 'What kind of support do you offer?',
    answer: 'We provide email support for all users, with priority support and dedicated account managers for Professional and Enterprise plans. We also have extensive documentation and video tutorials.'
  },
  {
    question: `How much can I save on energy costs?`,
    answer: `Facilities typically see ${ENERGY_SAVINGS.percentage} reduction in energy costs through optimized lighting schedules and fixture selection. ${ENERGY_SAVINGS.disclaimer}`
  },
  {
    question: 'Do you integrate with other systems?',
    answer: 'Yes, VibeLux integrates with popular BMS systems, environmental controllers, and business software. We also provide an API for custom integrations.'
  },
  {
    question: 'Is there a mobile app?',
    answer: 'Yes, VibeLux works on all devices through your web browser. We also have native iOS and Android apps for field work and monitoring.'
  }
]

export function SimplifiedFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-400">
            Get answers to common questions about VibeLux
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
              >
                <span className="text-lg font-medium text-white">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-400">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">
            Still have questions?
          </p>
          <a
            href="/support"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            Contact our support team
            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
          </a>
        </div>
      </div>
    </section>
  )
}