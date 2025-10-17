'use client'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        <p className="text-gray-300 text-sm">
          These Terms govern your use of the VibeLux platform. By using the service, you agree to these Terms.
        </p>
        <h2 className="text-xl font-semibold">1. Use of Service</h2>
        <p className="text-gray-300 text-sm">You must comply with all applicable laws and our Acceptable Use guidelines.</p>
        <h2 className="text-xl font-semibold">2. Payment & Billing</h2>
        <p className="text-gray-300 text-sm">Paid plans renew automatically. Cancel before your renewal to avoid charges. Trials end automatically unless continued.</p>
        <h2 className="text-xl font-semibold">3. Content & IP</h2>
        <p className="text-gray-300 text-sm">You retain ownership of your content. We grant you a license to use the platform; you grant us a license to process your content to provide the services.</p>
        <h2 className="text-xl font-semibold">4. Disclaimers</h2>
        <p className="text-gray-300 text-sm">We provide the service “as is”. Energy savings and agronomic outcomes vary by site and conditions.</p>
      </div>
    </div>
  )
}


