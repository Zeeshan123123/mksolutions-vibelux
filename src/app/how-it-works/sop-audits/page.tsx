export const metadata = {
  title: 'How SOP Audits Work | VibeLux',
  description: 'Learn how to create SOPs, run check-ins, verify sign-offs, and review audit trails (user/time/IP/UA, revisions, diff summaries).'
}

export default function HowSOPAuditsWork() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-900/30 border border-purple-700/40 rounded-full text-purple-300 text-sm mb-4">How it works</div>
          <h1 className="text-4xl font-bold">SOPs, Check-ins, and Audit Trails</h1>
          <p className="text-gray-400 mt-3">End-to-end operational compliance with versioned SOPs, tracked check-ins, and reviewer sign-off.</p>
        </div>

        <ol className="space-y-6 list-decimal list-inside text-gray-200">
          <li>
            <span className="font-semibold">Create an SOP</span>
            <div className="text-gray-400 text-sm">Author content, steps, safety notes, and tags. Each save records a version and supports future revision history.</div>
          </li>
          <li>
            <span className="font-semibold">Run a Check-in</span>
            <div className="text-gray-400 text-sm">Operators complete steps on the floor. We capture user, start/end times, completion rate, and IP/user-agent for accountability. Optional facility/location/batch context.</div>
          </li>
          <li>
            <span className="font-semibold">Verify (Sign-off)</span>
            <div className="text-gray-400 text-sm">A reviewer verifies completed check-ins, stamping verifiedBy/verifiedAt for compliance and QA.</div>
          </li>
          <li>
            <span className="font-semibold">Review Revisions</span>
            <div className="text-gray-400 text-sm">SOP edits are versioned. Revisions store who/when, change log, and diff summaries. Compare change history quickly.</div>
          </li>
          <li>
            <span className="font-semibold">Activity Feed & Exports</span>
            <div className="text-gray-400 text-sm">The SOP manager shows recent check-ins and revisions (who/when/IP/UA). Export logs on demand for audits and certifications.</div>
          </li>
        </ol>

        <div className="grid md:grid-cols-2 gap-4 pt-4">
          <a href="/sop-library" className="p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700 transition">
            <div className="font-semibold">Open SOP Library</div>
            <div className="text-sm text-gray-400">Create, manage, and version operational documents</div>
          </a>
          <a href="/security" className="p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700 transition">
            <div className="font-semibold">Security & Compliance</div>
            <div className="text-sm text-gray-400">Learn how we secure data and support audits</div>
          </a>
        </div>
      </div>
    </div>
  )
}


