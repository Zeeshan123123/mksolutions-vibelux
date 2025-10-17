'use client'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        <h1 className="text-3xl font-bold">Cookie Policy</h1>
        <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        <p className="text-gray-300 text-sm">
          We use necessary cookies for authentication and security, and optional cookies for analytics.
        </p>
        <h2 className="text-xl font-semibold">Your Choices</h2>
        <p className="text-gray-300 text-sm">You can disable non-essential cookies in your browser. Some features may not function without them.</p>
      </div>
    </div>
  )
}


