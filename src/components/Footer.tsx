import Link from 'next/link'
import Image from 'next/image'
import { getCopyrightYears } from '@/lib/utils/date'

export function Footer() {
  return (
    <footer className="border-t border-gray-800 py-12 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Image
              src="/vibelux-logo-correct.svg"
              alt="VibeLux"
              width={240}
              height={72}
              className="h-16 lg:h-20 w-auto"
            />
            <p className="text-gray-400 text-sm">
              The future of controlled environment agriculture.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-white">Platform</h4>
            <div className="space-y-2">
              <Link href="/control-center" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Control Center
              </Link>
              <Link href="/dashboard" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Dashboard
              </Link>
              <Link href="/energy" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Energy Management
              </Link>
              <Link href="/calculators" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Pro Calculators
              </Link>
              <Link href="/design" className="block text-gray-400 hover:text-white transition-colors text-sm">
                AI Design Studio
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-white">Solutions</h4>
            <div className="space-y-2">
              <Link href="/research-library" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Research Library
              </Link>
              <Link href="/marketplace" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Marketplace
              </Link>
              <Link href="/marketplace/my-licenses" className="block text-gray-400 hover:text-white transition-colors text-sm">
                My Licenses
              </Link>
              <Link href="/marketplace/seller" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Seller Portal
              </Link>
              <Link href="/energy-optimization" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Energy Optimization
              </Link>
              <Link href="/VibeLux-Partnership-Deck.html" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Partnership Opportunities
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-white">Company</h4>
            <div className="space-y-2">
              <Link href="/about" className="block text-gray-400 hover:text-white transition-colors text-sm">
                About
              </Link>
              <Link href="/how-it-works" className="block text-gray-400 hover:text-white transition-colors text-sm">
                How It Works
              </Link>
              <Link href="/how-it-works/sop-audits" className="block text-gray-400 hover:text-white transition-colors text-sm">
                SOP Audits
              </Link>
              <Link href="/getting-started" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Getting Started
              </Link>
              <Link href="/glossary" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Glossary
              </Link>
              <Link href="/faq" className="block text-gray-400 hover:text-white transition-colors text-sm">
                FAQ
              </Link>
              <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Contact
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {getCopyrightYears()} VibeLux. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}