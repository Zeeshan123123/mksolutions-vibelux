'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Building2, Users, DollarSign, Eye, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

export function AdminOperationsContent() {
  const [acctStatus, setAcctStatus] = useState<'connected'|'disconnected'|'checking'|'error'>('checking')
  const [erpConnections, setErpConnections] = useState<any[]>([])
  const [facilityId, setFacilityId] = useState<string>('')
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string>('')

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/accounting/connect').catch(() => null)
        if (res && res.ok) {
          setAcctStatus('connected')
        } else {
          setAcctStatus('disconnected')
        }
      } catch {
        setAcctStatus('error')
      }
    })()
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/erp/connections')
        if (res.ok) {
          const data = await res.json()
          setErpConnections(data.connections || [])
        }
      } catch {}
    })()
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const f = await fetch('/api/facility')
        if (f.ok) {
          const data = await f.json()
          if (data?.facility?.id) setFacilityId(data.facility.id)
        }
      } catch {}
    })()
  }, [])

  const operationsLinks = [
    { title: 'Marketplace Admin', href: '/admin/marketplace', icon: Building2, description: 'Manage listings and vendors' },
    { title: 'Affiliate Program', href: '/admin/affiliates', icon: Users, description: 'Partner management' },
    { title: 'Revenue Tracking', href: '/admin/revenue', icon: DollarSign, description: 'Financial analytics' },
    { title: 'Visual Operations', href: '/admin/visual-operations', icon: Eye, description: 'Operations dashboard' }
  ]

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Accounting integration card */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-lg">Accounting Integration</CardTitle>
              <CardDescription>Connect and synchronize invoices/payments</CardDescription>
            </div>
            <Badge className={acctStatus==='connected' ? 'bg-green-900/30 text-green-400' : acctStatus==='error' ? 'bg-red-900/30 text-red-400' : 'bg-gray-700'}>
              {acctStatus==='connected' ? 'Connected' : acctStatus==='error' ? 'Error' : acctStatus==='checking' ? 'Checking' : 'Not Connected'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-x-4 mb-2">
            <a href="/api/accounting/connect" className="inline-flex items-center gap-2 text-purple-300">Connect<ArrowRight className="w-4 h-4" /></a>
            <button
              disabled={!facilityId || syncing}
              onClick={async () => {
                try {
                  setSyncing(true)
                  setSyncMessage('')
                  const res = await fetch('/api/accounting/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ facilityId, operation: 'sync' })
                  })
                  const data = await res.json().catch(() => ({}))
                  if (res.ok) {
                    const invFetched = data?.data?.invoices ?? data?.invoices ?? 0
                    const invPersisted = data?.data?.persisted ?? data?.persisted ?? 0
                    const payFetched = data?.data?.payments ?? data?.payments ?? 0
                    const payPersisted = data?.data?.paymentsPersisted ?? data?.paymentsPersisted ?? 0
                    setSyncMessage(`Sync complete: invoices ${invPersisted}/${invFetched}, payments ${payPersisted}/${payFetched}`)
                    // refresh ERP connections to show updated lastSync
                    const er = await fetch('/api/erp/connections')
                    if (er.ok) {
                      const d = await er.json().catch(() => null)
                      if (d?.connections) setErpConnections(d.connections)
                    }
                  } else {
                    setSyncMessage(data?.error || 'Sync failed')
                  }
                } catch {
                  setSyncMessage('Sync failed')
                } finally {
                  setSyncing(false)
                }
              }}
              className={`inline-flex items-center gap-2 ${(!facilityId || syncing) ? 'text-gray-500 cursor-not-allowed' : 'text-purple-300'}`}
            >
              {syncing ? 'Syncing…' : 'Sync Now'}<ArrowRight className="w-4 h-4" />
            </button>
            <a href="/api/accounting/invoices" className="inline-flex items-center gap-2 text-purple-300">Invoices<ArrowRight className="w-4 h-4" /></a>
            <a href="/api/accounting/payments" className="inline-flex items-center gap-2 text-purple-300">Payments<ArrowRight className="w-4 h-4" /></a>
            {facilityId && (
              <a href={`/api/accounting/connect?provider=quickbooks&facilityId=${facilityId}`} className="inline-flex items-center gap-2 text-green-300">Connect QuickBooks<ArrowRight className="w-4 h-4" /></a>
            )}
          </div>
          {syncMessage && (
            <div className="text-xs text-gray-400 mb-4">{syncMessage}</div>
          )}
          <div className="border border-gray-700 rounded-lg divide-y divide-gray-800">
            <div className="px-3 py-2 text-sm text-gray-400">ERP Connections</div>
            {erpConnections.length === 0 && (
              <div className="px-3 py-3 text-sm text-gray-500">No connections configured</div>
            )}
            {erpConnections.map((c: any) => (
              <div key={`${c.provider}`} className="px-3 py-3 text-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-gray-300 font-medium">{c.provider}</span>
                  <span className={`px-2 py-0.5 rounded ${c.status==='CONNECTED' ? 'bg-green-900/30 text-green-400' : c.status==='ERROR' ? 'bg-red-900/30 text-red-400' : 'bg-gray-700 text-gray-300'}`}>{c.status || 'DISCONNECTED'}</span>
                  {c.lastSync && (
                    <span className="text-gray-500">Last sync: {new Date(c.lastSync).toLocaleString()}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="px-2 py-1 border border-gray-700 rounded hover:bg-gray-700"
                    onClick={async () => {
                      await fetch('/api/erp/connections', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: c.provider, setDisconnected: true }) })
                      const res = await fetch('/api/erp/connections');
                      if (res.ok) setErpConnections((await res.json()).connections || [])
                    }}
                  >Disconnect</button>
                  <button
                    className="px-2 py-1 border border-gray-700 rounded hover:bg-gray-700"
                    onClick={async () => {
                      await fetch('/api/erp/connections', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: c.provider, setConnected: true }) })
                      const res = await fetch('/api/erp/connections');
                      if (res.ok) setErpConnections((await res.json()).connections || [])
                    }}
                  >Set Connected</button>
                  <button
                    className="px-2 py-1 border border-gray-700 rounded hover:bg-gray-700"
                    onClick={async () => {
                      await fetch('/api/accounting/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: c.provider }) })
                      const res = await fetch('/api/erp/connections');
                      if (res.ok) setErpConnections((await res.json()).connections || [])
                    }}
                  >Refresh Token</button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {operationsLinks.map((link) => {
        const Icon = link.icon
        return (
          <Link key={link.title} href={link.href}>
            <Card className="border-gray-700 bg-gray-800 hover:bg-gray-700 transition-colors h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-900/30 rounded-lg">
                    <Icon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg">{link.title}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        )
      })}

      {/* Affiliate stats (wired to APIs) */}
      <AffiliateOverviewCard />

      {/* Marketplace overview */}
      <MarketplaceOverviewCard />
    </div>
  )
}

function AffiliateOverviewCard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({ clicks: 0, conversions: 0, revenue: 0 })
  const [links, setLinks] = useState<any[]>([])
  const [referrals, setReferrals] = useState<any[]>([])

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const [s, l, r] = await Promise.all([
          fetch('/api/affiliate/stats').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/affiliate/links').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/affiliate/referrals').then(r => r.ok ? r.json() : null).catch(() => null)
        ])
        if (s) setStats(s)
        if (l?.links) setLinks(l.links)
        if (r?.referrals) setReferrals(r.referrals)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <Card className="border-gray-700 bg-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg">Affiliate Overview</CardTitle>
          <Badge className="bg-gray-700">{loading ? 'Loading' : 'Live'}</Badge>
        </div>
        <CardDescription>Clicks, conversions, revenue and recent links</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-400">Clicks (30d)</div>
            <div className="text-2xl text-white font-bold">{stats.clicks ?? 0}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Conversions (30d)</div>
            <div className="text-2xl text-white font-bold">{stats.conversions ?? 0}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Revenue (30d)</div>
            <div className="text-2xl text-white font-bold">${(stats.revenue ?? 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-300 mb-2">Recent Links</div>
            <div className="space-y-2 max-h-48 overflow-auto">
              {links.slice(0, 6).map((lnk: any) => (
                <div key={lnk.id} className="p-2 bg-gray-900 rounded text-sm text-gray-300 flex justify-between">
                  <span>{lnk.shortCode || lnk.short_code || lnk.id}</span>
                  <a className="text-purple-300" href={`/go/${lnk.shortCode || lnk.short_code}`} target="_blank">Open</a>
                </div>
              ))}
              {!loading && links.length === 0 && <div className="text-gray-500 text-sm">No links</div>}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-300 mb-2">Recent Referrals</div>
            <div className="space-y-2 max-h-48 overflow-auto">
              {referrals.slice(0, 6).map((rf: any, idx: number) => (
                <div key={idx} className="p-2 bg-gray-900 rounded text-sm text-gray-300 flex justify-between">
                  <span>{rf.email || rf.user || 'Referral'}</span>
                  <span className="text-gray-500">{rf.status || 'new'}</span>
                </div>
              ))}
              {!loading && referrals.length === 0 && <div className="text-gray-500 text-sm">No referrals</div>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MarketplaceOverviewCard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>({ listings: 0, sales: 0, revenue: 0 })
  const [listings, setListings] = useState<any[]>([])

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const [s, l] = await Promise.all([
          fetch('/api/marketplace/stats').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/marketplace/listings').then(r => r.ok ? r.json() : null).catch(() => null)
        ])
        if (s) setStats(s)
        if (Array.isArray(l)) setListings(l)
        if (l?.listings) setListings(l.listings)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <Card className="border-gray-700 bg-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg">Marketplace Overview</CardTitle>
          <Badge className="bg-gray-700">{loading ? 'Loading' : 'Live'}</Badge>
        </div>
        <CardDescription>Listings, sales, revenue and recent items</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-400">Active Listings</div>
            <div className="text-2xl text-white font-bold">{stats.listings ?? listings.length ?? 0}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Sales (30d)</div>
            <div className="text-2xl text-white font-bold">{stats.sales ?? 0}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Revenue (30d)</div>
            <div className="text-2xl text-white font-bold">${(stats.revenue ?? 0).toLocaleString()}</div>
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-300 mb-2">Recent Listings</div>
          <div className="space-y-2 max-h-48 overflow-auto">
            {listings.slice(0, 6).map((it: any) => (
              <div key={it.id} className="p-2 bg-gray-900 rounded text-sm text-gray-300 flex justify-between">
                <span className="truncate mr-2">{it.title || it.name || it.id}</span>
                <span className="text-gray-500">{it.price ? `$${Number(it.price).toLocaleString()}` : ''}</span>
              </div>
            ))}
            {!loading && listings.length === 0 && <div className="text-gray-500 text-sm">No listings</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}