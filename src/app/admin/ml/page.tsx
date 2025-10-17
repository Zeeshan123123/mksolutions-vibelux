'use client'

import React, { useEffect, useMemo, useState } from 'react'

export default function AdminMLPage() {
  const [models, setModels] = useState<any[]>([])
  const [datasets, setDatasets] = useState<any[]>([])
  const [runs, setRuns] = useState<any[]>([])
  const [metrics, setMetrics] = useState<{ total:number; completed:number; failed:number; avgAccuracy?: number; driftPct?: number } | null>(null)
  const [newModel, setNewModel] = useState({ name: '', type: 'generic', version: 'v1' })
  const [newDataset, setNewDataset] = useState({ name: '', description: '', source: '' })
  const [newRun, setNewRun] = useState({ modelId: '', datasetId: '' })

  const reload = async () => {
    const [m, d, r] = await Promise.all([
      fetch('/api/ml/models').then(r => r.ok ? r.json() : { models: [] }),
      fetch('/api/ml/datasets').then(r => r.ok ? r.json() : { datasets: [] }),
      fetch('/api/ml/runs').then(r => r.ok ? r.json() : { runs: [] }),
    ])
    setModels(m.models || [])
    setDatasets(d.datasets || [])
    const runsData = r.runs || []
    setRuns(runsData)
    // Compute simple metrics and drift indicator
    const total = runsData.length
    const completed = runsData.filter((x:any) => x.status === 'completed').length
    const failed = runsData.filter((x:any) => x.status === 'failed').length
    const accs = runsData.map((x:any) => Number(x.metrics?.accuracy)).filter((v:number) => !isNaN(v))
    const avgAccuracy = accs.length ? accs.reduce((a:number,b:number)=>a+b,0)/accs.length : undefined

    // Drift calculation: compare recent 14d completed runs vs. 30-60d baseline if available
    const now = Date.now()
    const d14 = 14*24*60*60*1000
    const d30 = 30*24*60*60*1000
    const d60 = 60*24*60*60*1000
    const recent = runsData.filter((x:any) => x.status==='completed' && x.metrics?.accuracy!=null && (now - new Date(x.startedAt).getTime()) <= d14)
    const baseline = runsData.filter((x:any) => x.status==='completed' && x.metrics?.accuracy!=null && (now - new Date(x.startedAt).getTime()) > d30 && (now - new Date(x.startedAt).getTime()) <= d60)
    const avg = (arr:any[]) => arr.length ? arr.reduce((s:number, r:any)=> s + Number(r.metrics.accuracy||0), 0) / arr.length : undefined
    const recentAvg = avg(recent)
    const baselineAvg = avg(baseline)
    let driftPct: number | undefined = undefined
    if (recentAvg != null && baselineAvg != null && baselineAvg > 0) {
      driftPct = (recentAvg - baselineAvg) / baselineAvg
    }

    setMetrics({ total, completed, failed, avgAccuracy, driftPct })
  }

  useEffect(() => { reload() }, [])

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">ML Registry</h1>
        {metrics && (
          <div className="mb-6 grid md:grid-cols-4 gap-3">
            <div className="bg-gray-900 border border-gray-800 rounded p-3">
              <div className="text-xs text-gray-400">Total Runs</div>
              <div className="text-xl text-white font-semibold">{metrics.total}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded p-3">
              <div className="text-xs text-gray-400">Completed</div>
              <div className="text-xl text-green-400 font-semibold">{metrics.completed}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded p-3">
              <div className="text-xs text-gray-400">Failed</div>
              <div className="text-xl text-red-400 font-semibold">{metrics.failed}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded p-3">
              <div className="text-xs text-gray-400">Avg Accuracy</div>
              <div className="text-xl text-white font-semibold">{metrics.avgAccuracy != null ? (metrics.avgAccuracy*100).toFixed(1)+'%' : '—'}</div>
            </div>
            {/* Drift indicator spans full width on small screens */}
            <div className="bg-gray-900 border border-gray-800 rounded p-3 md:col-span-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400">Accuracy Drift (last 14d vs. 30–60d)</div>
                  <div className={`text-lg font-semibold ${metrics.driftPct!=null ? (metrics.driftPct < -0.05 ? 'text-red-400' : metrics.driftPct > 0.02 ? 'text-green-400' : 'text-gray-200') : 'text-gray-400'}`}>
                    {metrics.driftPct!=null ? `${(metrics.driftPct*100).toFixed(1)}%` : 'n/a'}
                  </div>
                </div>
                {/* Simple sparkline for recent accuracies */}
                <Sparklines data={(runs||[]).map((r:any)=> Number(r.metrics?.accuracy)).filter((v:number)=>!isNaN(v)).slice(0,20).reverse()} />
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Models */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold">Models</h2>
              <span className="text-xs text-gray-500">{models.length}</span>
            </div>
            <div className="space-y-2 max-h-64 overflow-auto mb-3">
              {models.map((m) => (
                <div key={m.id} className="p-2 bg-gray-800 rounded text-sm text-gray-200 flex justify-between">
                  <div>
                    <div className="font-medium">{m.name} • {m.version}</div>
                    <div className="text-xs text-gray-400">{m.type} • {m.status}</div>
                  </div>
                </div>
              ))}
              {models.length === 0 && (
                <div className="text-sm text-gray-500">No models</div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white" placeholder="Name" value={newModel.name} onChange={(e) => setNewModel({ ...newModel, name: e.target.value })} />
              <input className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white" placeholder="Type" value={newModel.type} onChange={(e) => setNewModel({ ...newModel, type: e.target.value })} />
              <input className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white" placeholder="Version" value={newModel.version} onChange={(e) => setNewModel({ ...newModel, version: e.target.value })} />
            </div>
            <button className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm" onClick={async () => {
              if (!newModel.name) return;
              await fetch('/api/ml/models', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newModel) })
              setNewModel({ name: '', type: 'generic', version: 'v1' })
              await reload()
            }}>Add Model</button>
          </div>

          {/* Datasets */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold">Datasets</h2>
              <span className="text-xs text-gray-500">{datasets.length}</span>
            </div>
            <div className="space-y-2 max-h-64 overflow-auto mb-3">
              {datasets.map((d) => (
                <div key={d.id} className="p-2 bg-gray-800 rounded text-sm text-gray-200 flex justify-between">
                  <div>
                    <div className="font-medium">{d.name}</div>
                    <div className="text-xs text-gray-400">{d.source || 'custom'}</div>
                  </div>
                </div>
              ))}
              {datasets.length === 0 && (
                <div className="text-sm text-gray-500">No datasets</div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white" placeholder="Name" value={newDataset.name} onChange={(e) => setNewDataset({ ...newDataset, name: e.target.value })} />
              <input className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white" placeholder="Description" value={newDataset.description} onChange={(e) => setNewDataset({ ...newDataset, description: e.target.value })} />
              <input className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white" placeholder="Source" value={newDataset.source} onChange={(e) => setNewDataset({ ...newDataset, source: e.target.value })} />
            </div>
            <button className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm" onClick={async () => {
              if (!newDataset.name) return;
              await fetch('/api/ml/datasets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newDataset) })
              setNewDataset({ name: '', description: '', source: '' })
              await reload()
            }}>Add Dataset</button>
          </div>

          {/* Training Runs */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold">Training Runs</h2>
              <span className="text-xs text-gray-500">{runs.length}</span>
            </div>
            <div className="space-y-2 max-h-64 overflow-auto mb-3">
              {runs.map((r) => (
                <div key={r.id} className="p-2 bg-gray-800 rounded text-sm text-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{r.model?.name || 'Model'} • {r.status}</div>
                    <div className="text-xs text-gray-500">{new Date(r.startedAt).toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-gray-400">Dataset: {r.dataset?.name || 'n/a'}</div>
                  {r.metrics?.accuracy != null && (
                    <div className="text-xs text-gray-400">Accuracy: {(Number(r.metrics.accuracy)*100).toFixed(1)}%</div>
                  )}
                </div>
              ))}
              {runs.length === 0 && (
                <div className="text-sm text-gray-500">No runs</div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white" value={newRun.modelId} onChange={(e) => setNewRun({ ...newRun, modelId: e.target.value })}>
                <option value="">Select model…</option>
                {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <select className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm text-white" value={newRun.datasetId} onChange={(e) => setNewRun({ ...newRun, datasetId: e.target.value })}>
                <option value="">Select dataset…</option>
                {datasets.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <button className="mt-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm" onClick={async () => {
              if (!newRun.modelId) return;
              await fetch('/api/ml/runs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newRun) })
              setNewRun({ modelId: '', datasetId: '' })
              await reload()
            }}>Start Run</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Sparklines({ data }: { data: number[] }) {
  const points = useMemo(() => {
    if (!data || data.length === 0) return ''
    const w = 120
    const h = 30
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    return data.map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / range) * h
      return `${x},${y}`
    }).join(' ')
  }, [data])
  return (
    <svg width={120} height={30} className="opacity-80">
      <polyline fill="none" stroke="#a855f7" strokeWidth="2" points={points} />
    </svg>
  )
}


