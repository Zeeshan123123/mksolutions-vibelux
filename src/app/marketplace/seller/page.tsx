'use client'

import React, { useEffect, useState } from 'react'

export default function SellerOverviewPage() {
  const [data, setData] = useState<{ listings: any[]; purchases: any[] }>({ listings: [], purchases: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/marketplace/seller/overview')
      .then(r => r.ok ? r.json() : Promise.reject('Failed'))
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Seller Overview</h1>
      {loading ? <div>Loading…</div> : (
        <>
          <section>
            <h2 className="text-lg font-medium mb-2">Listings</h2>
            {data.listings.length === 0 ? <div className="text-sm text-muted-foreground">No listings</div> : (
              <div className="space-y-2">
                {data.listings.map((l: any) => (
                  <div key={l.id} className="border rounded p-3 text-sm flex items-center justify-between">
                    <div>
                      <div className="font-medium">{l.title}</div>
                      <div className="text-muted-foreground">Status: {l.status} • {l.exclusive ? 'Exclusive' : 'Non-exclusive'}</div>
                    </div>
                    <div className="text-xs">{(l.pricecents || l.priceCents)/100} {(l.currency || 'USD').toUpperCase()}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section>
            <h2 className="text-lg font-medium mb-2">Recent Purchases</h2>
            {data.purchases.length === 0 ? <div className="text-sm text-muted-foreground">No purchases</div> : (
              <div className="space-y-2">
                {data.purchases.map((p: any) => (
                  <div key={p.id} className="border rounded p-3 text-sm">
                    <div className="font-medium">{p.listingtitle || p.listingTitle}</div>
                    <div className="text-muted-foreground">Buyer: {p.buyeremail || p.buyerEmail || '—'}</div>
                    <div>Status: {p.status}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}


