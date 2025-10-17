'use client'

export default function DataProcessingAddendumPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        <h1 className="text-3xl font-bold">Data Processing Addendum (DPA)</h1>
        <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        <p className="text-gray-300 text-sm">
          This DPA forms part of our Terms and governs processing of personal data on your behalf.
        </p>
        <h2 className="text-xl font-semibold">Scope</h2>
        <p className="text-gray-300 text-sm">We act as a processor; you are the controller. We process only per your instructions.</p>
        <h2 className="text-xl font-semibold">Subprocessors</h2>
        <p className="text-gray-300 text-sm">We maintain a list of subprocessors (hosting, storage, analytics) provided upon request.</p>
      </div>
    </div>
  )
}


