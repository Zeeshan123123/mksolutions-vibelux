'use client'

import React, { useEffect, useState } from 'react'

export default function MyLicensesPage() {
  const [licenses, setLicenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/marketplace/my-licenses')
      .then(r => r.ok ? r.json() : Promise.reject('Failed'))
      .then(data => setLicenses(data.entitlements || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold">My Licenses</h1>
      {loading ? <div>Loading…</div> : licenses.length === 0 ? (
        <div className="text-sm text-muted-foreground">No licenses yet.</div>
      ) : (
        <div className="space-y-2">
          {licenses.map((e) => (
            <div key={e.id} className="border rounded p-3 text-sm">
              <div className="font-medium">{e.listingtitle || e.listingTitle || 'License'}</div>
              <div className="text-muted-foreground">Trial: {e.trialname || e.trialName}</div>
              <div>Status: {e.status}</div>
              <div>Granted: {new Date(e.grantedat || e.grantedAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


