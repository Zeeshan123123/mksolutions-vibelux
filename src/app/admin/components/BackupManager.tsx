'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Database, RefreshCw, Download, RotateCcw } from 'lucide-react'

type BackupItem = {
  id: string
  createdAt?: string
  sizeBytes?: number
  status?: string
}

export function BackupManager() {
  const [backups, setBackups] = useState<BackupItem[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  const refresh = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/backup/list')
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        setBackups(Array.isArray(data?.backups) ? data.backups : [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const createBackup = async () => {
    try {
      setCreating(true)
      await fetch('/api/admin/backup/create', { method: 'POST' })
      await refresh()
    } finally {
      setCreating(false)
    }
  }

  const restore = async (id: string) => {
    await fetch(`/api/admin/backup/${encodeURIComponent(id)}/restore`, { method: 'POST' })
  }

  return (
    <Card className="border-gray-700 bg-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-white">Backups</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <Button size="sm" onClick={createBackup} disabled={creating}>
              <Download className="w-4 h-4 mr-1" /> Create Backup
            </Button>
          </div>
        </div>
        <CardDescription>List, create, and restore database backups</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-300">
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">Created</th>
                <th className="text-left p-2">Size</th>
                <th className="text-left p-2">Status</th>
                <th className="text-right p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.length === 0 && (
                <tr>
                  <td className="p-3 text-gray-400" colSpan={5}>{loading ? 'Loading...' : 'No backups found'}</td>
                </tr>
              )}
              {backups.map(b => (
                <tr key={b.id} className="border-b border-gray-800">
                  <td className="p-2 text-white">{b.id}</td>
                  <td className="p-2 text-gray-300">{b.createdAt ? new Date(b.createdAt).toLocaleString() : '—'}</td>
                  <td className="p-2 text-gray-300">{b.sizeBytes ? `${(b.sizeBytes/1024/1024).toFixed(1)} MB` : '—'}</td>
                  <td className="p-2">{b.status ? <Badge className="bg-gray-700">{b.status}</Badge> : <Badge className="bg-gray-700">ready</Badge>}</td>
                  <td className="p-2 text-right">
                    <Button variant="outline" size="sm" onClick={() => restore(b.id)}>
                      <RotateCcw className="w-4 h-4 mr-1" /> Restore
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}


