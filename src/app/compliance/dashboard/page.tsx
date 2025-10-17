"use client"

import { useMemo, useState } from 'react'

export default function ComplianceDashboardPage() {
  const [facilityId, setFacilityId] = useState('')
  const [pesticides, setPesticides] = useState<any[]>([])
  const [certs, setCerts] = useState<any[]>([])
  const [batches, setBatches] = useState<any | null>(null)
  const [ccp, setCcp] = useState<any[]>([])
  const [batchCode, setBatchCode] = useState('')
  const [newCert, setNewCert] = useState<{ certType: string; issuer: string; identifier?: string; expiryDate?: string }>(() => ({ certType: '', issuer: '', identifier: '', expiryDate: '' }))
  const [newApp, setNewApp] = useState<{ productName: string; dose: number; doseUnit?: string; preHarvestIntervalDays?: number }>(() => ({ productName: '', dose: 0, doseUnit: 'ml/L', preHarvestIntervalDays: 0 }))
  const [newCcp, setNewCcp] = useState<{ ccpName: string; value: number; unit?: string; limitMin?: number; limitMax?: number; notes?: string }>({ ccpName: '', value: 0, unit: '°C', limitMin: undefined, limitMax: undefined, notes: '' })

  const loadAll = async () => {
    if (!facilityId) return
    const [inv, apps, cert, ccpRes] = await Promise.all([
      fetch(`/api/compliance/pesticides/inventory?facilityId=${facilityId}`),
      fetch(`/api/compliance/pesticides/applications?facilityId=${facilityId}&days=60`),
      fetch(`/api/compliance/certificates?facilityId=${facilityId}`),
      fetch(`/api/compliance/haccp/ccp?facilityId=${facilityId}&limit=50`)
    ])
    const invRows = await inv.json()
    const appRows = await apps.json()
    setPesticides([...(invRows || []), ...(appRows || [])])
    setCerts(await cert.json())
    setCcp(await ccpRes.json())
  }

  const traceBatch = async () => {
    if (!facilityId || !batchCode) return
    const res = await fetch(`/api/compliance/coc?facilityId=${facilityId}&batchCode=${encodeURIComponent(batchCode)}`)
    setBatches(await res.json())
  }

  const expiring = useMemo(() => (certs || []).filter((c: any) => c.expiryDate && new Date(c.expiryDate) < new Date(Date.now() + 30*24*60*60*1000)), [certs])
  const blockedHarvest = useMemo(() => (pesticides || []).filter((p: any) => p.harvestBlocked), [pesticides])

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Compliance Dashboard</h1>
          <p className="text-gray-400">Pesticides, HACCP, certificates, and chain-of-custody overview.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 outline-none" placeholder="Facility ID" value={facilityId} onChange={(e) => setFacilityId(e.target.value)} />
          <button onClick={loadAll} className="bg-purple-600 hover:bg-purple-700 rounded-lg px-4 py-2 disabled:opacity-50" disabled={!facilityId}>Load</button>
          <div className="flex gap-2">
            <input className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 outline-none" placeholder="Trace batch code" value={batchCode} onChange={(e) => setBatchCode(e.target.value)} />
            <button onClick={traceBatch} className="bg-gray-800 hover:bg-gray-700 rounded-lg px-3 py-2 border border-gray-700">Trace</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Expiring Certificates (30d)</div>
            <div className="text-2xl font-bold">{expiring.length}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">PHI Blocks</div>
            <div className="text-2xl font-bold">{blockedHarvest.length}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Recent CCP Logs</div>
            <div className="text-2xl font-bold">{ccp.length}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-3">Certificates</h2>
            {/* Quick Add Certificate */}
            <div className="bg-gray-800/50 rounded-lg p-3 mb-3 grid grid-cols-1 md:grid-cols-4 gap-2">
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" placeholder="Type" value={newCert.certType} onChange={(e) => setNewCert({ ...newCert, certType: e.target.value })} />
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" placeholder="Issuer" value={newCert.issuer} onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })} />
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" placeholder="Identifier" value={newCert.identifier} onChange={(e) => setNewCert({ ...newCert, identifier: e.target.value })} />
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" type="date" placeholder="Expiry" value={newCert.expiryDate} onChange={(e) => setNewCert({ ...newCert, expiryDate: e.target.value })} />
              <div className="md:col-span-4 text-right">
                <button className="bg-purple-600 hover:bg-purple-700 rounded px-3 py-1 text-sm" disabled={!facilityId || !newCert.certType || !newCert.issuer} onClick={async () => {
                  await fetch('/api/compliance/certificates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ facilityId, ...newCert }) })
                  setNewCert({ certType: '', issuer: '', identifier: '', expiryDate: '' })
                  await loadAll()
                }}>Add Certificate</button>
              </div>
            </div>
            <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
              {certs.map((c: any) => (
                <div key={c.id} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{c.certType} — {c.issuer}</div>
                      <div className="text-xs text-gray-400">{c.identifier || ''}</div>
                    </div>
                    <div className="text-right text-sm text-gray-300">{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : '—'}</div>
                  </div>
                </div>
              ))}
              {certs.length === 0 && (<div className="text-sm text-gray-500">No certificates</div>)}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-3">Pesticide Inventory & Applications</h2>
            {/* Quick Log Application */}
            <div className="bg-gray-800/50 rounded-lg p-3 mb-3 grid grid-cols-1 md:grid-cols-4 gap-2">
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" placeholder="Product" value={newApp.productName} onChange={(e) => setNewApp({ ...newApp, productName: e.target.value })} />
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" type="number" step="0.01" placeholder="Dose" value={newApp.dose} onChange={(e) => setNewApp({ ...newApp, dose: Number(e.target.value) })} />
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" placeholder="Unit" value={newApp.doseUnit} onChange={(e) => setNewApp({ ...newApp, doseUnit: e.target.value })} />
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" type="number" placeholder="PHI (days)" value={newApp.preHarvestIntervalDays} onChange={(e) => setNewApp({ ...newApp, preHarvestIntervalDays: Number(e.target.value) })} />
              <div className="md:col-span-4 text-right">
                <button className="bg-purple-600 hover:bg-purple-700 rounded px-3 py-1 text-sm" disabled={!facilityId || !newApp.productName || !newApp.dose} onClick={async () => {
                  await fetch('/api/compliance/pesticides/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ facilityId, ...newApp }) })
                  setNewApp({ productName: '', dose: 0, doseUnit: 'ml/L', preHarvestIntervalDays: 0 })
                  await loadAll()
                }}>Log Application</button>
              </div>
            </div>
            <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
              {pesticides.map((p: any, idx: number) => (
                <div key={p.id || idx} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-sm text-gray-300">{p.productName || p.lotNumber || 'Application'}</div>
                  {p.applicationDate && (
                    <div className="text-xs text-gray-400">Applied {new Date(p.applicationDate).toLocaleString()} {p.harvestBlocked ? '• PHI active' : ''}</div>
                  )}
                </div>
              ))}
              {pesticides.length === 0 && (<div className="text-sm text-gray-500">No pesticide records</div>)}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-3">HACCP CCP Logs</h2>
            {/* Quick Log CCP */}
            <div className="bg-gray-800/50 rounded-lg p-3 mb-3 grid grid-cols-1 md:grid-cols-6 gap-2">
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" placeholder="CCP Name (e.g., Cooler Temp)" value={newCcp.ccpName} onChange={(e) => setNewCcp({ ...newCcp, ccpName: e.target.value })} />
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" type="number" step="0.01" placeholder="Value" value={newCcp.value} onChange={(e) => setNewCcp({ ...newCcp, value: Number(e.target.value) })} />
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" placeholder="Unit" value={newCcp.unit} onChange={(e) => setNewCcp({ ...newCcp, unit: e.target.value })} />
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" type="number" step="0.01" placeholder="Min Limit" value={newCcp.limitMin ?? ''} onChange={(e) => setNewCcp({ ...newCcp, limitMin: e.target.value === '' ? undefined : Number(e.target.value) })} />
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" type="number" step="0.01" placeholder="Max Limit" value={newCcp.limitMax ?? ''} onChange={(e) => setNewCcp({ ...newCcp, limitMax: e.target.value === '' ? undefined : Number(e.target.value) })} />
              <input className="md:col-span-6 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" placeholder="Notes (optional)" value={newCcp.notes} onChange={(e) => setNewCcp({ ...newCcp, notes: e.target.value })} />
              <div className="text-right md:col-span-6">
                <button className="bg-purple-600 hover:bg-purple-700 rounded px-3 py-1 text-sm" disabled={!facilityId || !newCcp.ccpName || !(newCcp.value || newCcp.value === 0)} onClick={async () => {
                  await fetch('/api/compliance/haccp/ccp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ facilityId, ...newCcp }) })
                  setNewCcp({ ccpName: '', value: 0, unit: '°C', limitMin: undefined, limitMax: undefined, notes: '' })
                  await loadAll()
                }}>Log CCP</button>
              </div>
            </div>
            <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
              {ccp.map((r: any) => (
                <div key={r.id} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-300">{r.ccpName} — {r.value}{r.unit || ''}</div>
                    <div className={`text-xs ${r.compliant ? 'text-green-400' : 'text-red-400'}`}>{r.compliant ? 'OK' : 'OUT OF LIMIT'}</div>
                  </div>
                  <div className="text-xs text-gray-500">{new Date(r.timestamp).toLocaleString()}</div>
                </div>
              ))}
              {ccp.length === 0 && (<div className="text-sm text-gray-500">No CCP records</div>)}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-3">Batch Trace</h2>
            {batches ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Batch</div>
                  <div className="text-white font-medium">{batches.batch?.batchCode}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Parents</div>
                  <div className="text-white font-medium">{(batches.parents || []).map((b: any) => b.batchCode).join(', ') || '—'}</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-sm text-gray-400">Children</div>
                  <div className="text-white font-medium">{(batches.children || []).map((b: any) => b.batchCode).join(', ') || '—'}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Enter a batch code to trace</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


