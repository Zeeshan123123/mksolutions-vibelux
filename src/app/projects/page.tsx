'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Project = {
  id: string
  name: string
  description?: string | null
  createdAt?: string
  _count?: { spaces?: number; experiments?: number; savedDesigns?: number }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')

  const query = useMemo(() => `?page=${page}&limit=${limit}`, [page, limit])

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        setError('')
        const res = await fetch(`/api/projects${query}`)
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data?.error || 'Failed to load projects')
          setProjects([])
          setTotalPages(1)
          return
        }
        setProjects(data?.data || [])
        setTotalPages(data?.pagination?.totalPages || 1)
      } catch {
        setError('Failed to load projects')
      } finally {
        setLoading(false)
      }
    })()
  }, [query])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      setCreating(true)
      setMessage('')
      setError('')
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined })
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setMessage('Project created')
        setName('')
        setDescription('')
        // reload first page to show freshest
        setPage(1)
        const r = await fetch(`/api/projects?page=1&limit=${limit}`)
        const d = await r.json().catch(() => ({}))
        if (r.ok) {
          setProjects(d?.data || [])
          setTotalPages(d?.pagination?.totalPages || 1)
        }
      } else {
        setError(data?.error || 'Failed to create project')
      }
    } catch {
      setError('Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Projects</h1>
        <p className="text-gray-400">Create and manage your Vibelux projects</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="text-white font-semibold mb-3">Create Project</h2>
          <form onSubmit={onCreate} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white min-h-[80px]"
                placeholder="Optional"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                disabled={creating || !name.trim()}
                className={`px-3 py-2 rounded border ${creating || !name.trim() ? 'border-gray-700 text-gray-500' : 'border-purple-600 text-purple-300 hover:bg-purple-950/30'}`}
                type="submit"
              >{creating ? 'Creating…' : 'Create Project'}</button>
              {message && <span className="text-xs text-green-400">{message}</span>}
              {error && <span className="text-xs text-red-400">{error}</span>}
            </div>
          </form>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Your Projects</h2>
            <div className="flex items-center gap-2 text-sm">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2 py-1 border border-gray-700 rounded text-gray-300 disabled:text-gray-600"
              >Prev</button>
              <span className="text-gray-400">Page {page} / {totalPages}</span>
              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2 py-1 border border-gray-700 rounded text-gray-300 disabled:text-gray-600"
              >Next</button>
            </div>
          </div>
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : projects.length === 0 ? (
            <div className="text-sm text-gray-500">No projects yet</div>
          ) : (
            <div className="space-y-2">
              {projects.map((p) => (
                <div key={p.id} className="p-3 bg-gray-800 rounded border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{p.name}</div>
                      {p.description && <div className="text-sm text-gray-400">{p.description}</div>}
                      <div className="text-xs text-gray-500 mt-1">
                        {p._count?.spaces ?? 0} spaces • {p._count?.experiments ?? 0} active trials • {p._count?.savedDesigns ?? 0} saved designs
                      </div>
                    </div>
                    <div className="text-sm">
                      <Link className="text-purple-300" href="#">Open</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


